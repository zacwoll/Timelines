import { Server as HTTPServer } from "http";
import amqp, { ConsumeMessage, Replies } from "amqplib";
import dotenv from "dotenv";
import express, { Express } from "express";
import { RabbitmqService } from "./RabbitmqService"; // Importing our abstraction class

dotenv.config();

export class Server {
  private app: Express;
  private port: number;
  private server?: HTTPServer;
  private setupComplete: Promise<void>;
  private isReadyForConnections: boolean;
  private authChannel?: amqp.Channel;
  private rabbitmqService?: RabbitmqService;
  // private authQueueName?: string;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.setupComplete = this.setup();
    this.isReadyForConnections = false;
    void this.startServer();
  }

  // Public method to get the server
  public getServer() {
    return this.server;
  }

  // Set up express routes
  private setupRoutes() {
    this.app.use(express.json());

    // Webhook Endpoint
    // Webhook is what we need to use when authorizing a new guild
    this.app.post("/webhook", (req, res) => {
      const code = req.body.code;
      const guildId = req.body.guildId;

      console.log(`Authorization code: ${code}`);
      console.log(`Guild ID: ${guildId}`);
      console.log(
        `Sending to ${process.env.RABBITMQ_QUEUE} payload ${guildId}: ${code}`
      );
      this.authChannel?.sendToQueue(
        process.env.RABBITMQ_QUEUE || "",
        Buffer.from(`Stream Data: ${guildId}: ${code}`)
      );

      res.status(200).send(`${guildId}: ${code} received`);
    });

    // Timelines Endpoint for the user
    this.app.get("/timelines/:user", (req, res) => {
      const user = req.params.user;

      res.status(200).send(`Timeline data for user ${user}`);
    });
  }

  // Creates connection to Rabbitmq server
  private async setupMessaging(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Connect to RabbitMQ
        console.log("Setting up connection");
        const connectionOptions = {
          username: process.env.RABBITMQ_GATEWAY_USER || "",
          password: process.env.RABBITMQ_GATEWAY_PASSWD || "",
          hostname: 'localhost',// Might be 'rabbitmq' in the future, defined in our docker network as such
          port: process.env.RABBITMQ_PORT || "5672"
        }
        
        this.rabbitmqService = new RabbitmqService(connectionOptions);
        await this.rabbitmqService.connect();

        // Create the auth channel
        console.log("Setting up auth queue");
        const authQueueName = process.env.RABBITMQ_QUEUE || "auth_queue";
        const authExchangeName =
          process.env.RABBITMQ_EXCHANGE || "auth_exchange";
        console.log("Creating auth channel");
        const authChannel = await this.rabbitmqService.createChannel();

        // Pre-Fetch is required to begin processing
        await authChannel.prefetch(1);

        // Assert the auth queue and exchange
        await authChannel.assertQueue(authQueueName, {
          durable: true,
          arguments: {
            "x-queue-type": "stream",
            // 'exclusive': 'false'
          },
        });
        await authChannel.assertExchange(authExchangeName, "direct", {
          durable: true,
        });

        // Bind the queue to the exchange
        await authChannel.bindQueue(authQueueName, authExchangeName, "");

        // Save the auth channel
        this.authChannel = authChannel;

        console.log("Setup Auth Consumer");
        const consumerTag = await this.setupAuthConsumer(
          this.authChannel,
          authQueueName
        );
        console.log(consumerTag);

        console.log("Connected to RabbitMQ");
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Sets up a consumer for the auth exchange
  private async setupAuthConsumer(
    authChannel: amqp.Channel,
    authQueueName: string
  ): Promise<Replies.Consume> {
    return new Promise((resolve, reject) => {
      try {
        let consumerTag = authChannel.consume(
          authQueueName || "",
          (msg: ConsumeMessage | null) => {
            if (msg) {
              console.log(`Received message: ${msg.content.toString()}`);
              // Process message here
              authChannel.ack(msg); // Acknowledge message
            }
          }
        );
        resolve(consumerTag);
      } catch (err) {
        reject(err);
      }
    });
  }

  // setup function that runs all setup necessities
  // sets up routes
  // sets up Rabbitmq messaging
  private async setup(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.setupMessaging();
        this.setupRoutes();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  // Enable traffic for the server
  // Returns a promise that resolves a listening state
  // Enable traffic for the server
  private async listen(): Promise<void> {
    try {
      // If the server is not already running, start it.
      if (!this.server) {
        this.server = await new Promise((resolve) => {
          const serverInstance = this.app.listen(this.port, () => {
            this.isReadyForConnections = true;
            console.log(
              `Server is now listening at http://localhost:${this.port}`
            );
            resolve(serverInstance);
          });
        });
      } else {
        // The server is already running, so it is resuming.
        console.log(
          `Server is already running at http://localhost:${this.port}`
        );
        this.isReadyForConnections = true;
      }
    } catch (err) {
      // If there's an error starting the server, reject the promise.
      throw err;
    }
  }

  // When setup is complete, start the server
  public async startServer() {
    await this.setupComplete;
    await this.listen();
  }

  // Pauses traffic on the server
  public async pause() {
    if (this.server) {
      this.server.close();
      console.log("Server paused");
    }
  }

  // Resumes traffic on the server.
  public async resume() {
    await this.setupComplete;
    await this.listen();
  }

  // Stops the server and closes resources
  public async close() {
    // Closed all server traffic
    await this.server?.close();
    // Closed connection to RabbitMQ
    await this.rabbitmqService?.close();
  }

  // Returns a promise to be ready
  public async isReady(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.isReadyForConnections) {
        console.log("Is ready!");
        resolve();
      } else {
        const interval = setInterval(() => {
          if (this.isReadyForConnections) {
            clearInterval(interval);
            resolve();
          }
        }, 100);
      }
    });
  }
}

// // Demo Code: Instantiate the server and start it
const port = 3000; // Specify your desired port number
const server = new Server(port);
console.log(server);
// server.startServer().catch((error) => {
//   console.error("Failed to start the server:", error);
//   process.exit(1); // Terminate the process if the server fails to start
// });
