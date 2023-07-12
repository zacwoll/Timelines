import { Server as HTTPServer } from "http";
import amqp, { ConsumeMessage } from "amqplib";
import dotenv from "dotenv";
import express, { Express } from "express";
dotenv.config();

export class Server {
  private app: Express;
  private port: number;
  private server?: HTTPServer;
  private setupComplete: Promise<void>;
  private isReadyForConnections: boolean;
  private connection?: amqp.Connection;
  private authChannel?: amqp.Channel;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.setupComplete = this.setup();
    this.isReadyForConnections = false;
    void this.start();
  }

  // Public method to get the server
  public getServer() {
    return this.server;
  }

  // Set up express routes
  private setupRoutes() {
    this.app.use(express.json());

    // Webhook is what we need to use when authorizing a new guild
    this.app.post("/webhook", (req, res) => {
      const code = req.body.code;
      const guildId = req.body.guildId;

      console.log(`Authorization code: ${code}`);
      console.log(`Guild ID: ${guildId}`);

      res.sendStatus(200);
    });

    // Timelines Endpoint for the user
    this.app.get("/timelines/:user", (req, res) => {
      const user = req.params.user;

      res.send(`Timeline data for user ${user}`);
      res.sendStatus(200);
    });
  }

  // Creates connection to Rabbitmq server
  private async setupMessaging(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Connect to RabbitMQ
        console.log("Setting up connection");
        const rabbitmqHost = "localhost";
        // const rabbitmqHost = process.env.RABBITMQ_HOST || "localhost";
        const rabbitmqPort = process.env.RABBITMQ_PORT || 5672;
        const rabbitmqUser = process.env.RABBITMQ_GATEWAY_USER;
        const rabbitmqPass = process.env.RABBITMQ_GATEWAY_PASSWD;
        const rabbitmqAuthHost = process.env.RABBITMQ_AUTH_HOST || "";
        const connectionUrl = `amqp://${rabbitmqUser}:${rabbitmqPass}@${rabbitmqHost}:${rabbitmqPort}/${rabbitmqAuthHost}`;
        console.log(connectionUrl);
        this.connection = await amqp.connect(connectionUrl);

        // Create the auth channel
        console.log("Setting up auth queue");
        const authQueueName = process.env.RABBITMQ_QUEUE || "auth_queue";
        const authExchangeName =
          process.env.RABBITMQ_EXCHANGE || "auth_exchange";
        console.log("Creating auth channel");
        const authChannel = await this.connection.createChannel();

        // Assert the auth queue and exchange
        await authChannel.assertQueue(authQueueName, {
          durable: true,
        });
        await authChannel.assertExchange(authExchangeName, "direct", {
          durable: true,
        });

        // Bind the queue to the exchange
        await authChannel.bindQueue(authQueueName, authExchangeName, "");

        // Save the auth channel
        this.authChannel = authChannel;
        console.log("Setup Auth Connsumer");
        await this.setupAuthConsumer(this.authChannel);

        console.log("Connected to RabbitMQ");
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Sets up a consumer for the auth exchange
  private async setupAuthConsumer(authChannel: amqp.Channel): Promise<void> {
    try {
      const authQueueName = process.env.RABBITMQ_QUEUE || "auth_queue";

      await authChannel.consume(
        authQueueName,
        async (msg: ConsumeMessage | null) => {
          if (msg) {
            console.log(`Received message: ${msg.content.toString()}`);
            // Process message here
            authChannel.ack(msg); // Acknowledge message
          }
        }
      );

      console.log(`Auth consumer set up on ${authQueueName} queue`);
    } catch (error) {
      console.error(`Error setting up auth consumer: ${error}`);
    }
  }

  // setup function that runs all setup necessities
  // sets up routes
  // sets up Rabbitmq messaging
  private async setup(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        this.setupRoutes();
        await this.setupMessaging();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  // Enable traffic for the server
  private async listen(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (!this.server) {
          this.server = this.app.listen(this.port, () => {
            console.log(
              `Example app listening at http://localhost:${this.port}`
            );
            this.isReadyForConnections = true;
          });
        } else {
          console.log(`Example app resumed at http://localhost:${this.port}`);
          this.isReadyForConnections = true;
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  // When setup is complete, start the server
  public async start() {
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
    await this.connection?.close();
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
