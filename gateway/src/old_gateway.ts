import { Server as HTTPServer } from "http";
import amqp from "amqplib";
import dotenv from "dotenv";
import express, { Express } from "express";
import { RabbitmqServiceConfig, RabbitmqService } from "./RabbitmqService"; // Importing our abstraction class
import { MessageService } from "./MessageService";
import { GatewayServer } from "./GatewayServer";

dotenv.config();

export class Server {
  private app: Express;
  private port: number;
  private server?: HTTPServer;
  private setupComplete: Promise<void>;
  private isReadyForConnections: boolean;
  private authChannel?: amqp.Channel;
  private rabbitmqService?: RabbitmqService;
  private messageService?: MessageService;
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

  // setup function that runs all setup necessities
  // sets up routes
  // sets up Rabbitmq messaging
  private async setup(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const connectionOptions = {
          user: {
            username: process.env.RABBITMQ_GATEWAY_USER || "",
            password: process.env.RABBITMQ_GATEWAY_PASSWD || "",
          },
          // Might be 'rabbitmq' in the future, defined in our docker network as such
          hostname: 'localhost',
          port: process.env.RABBITMQ_PORT || "5672"
        }
        this.messageService = await this.setupMessageService(connectionOptions);
        this.setupRoutes();
        // this.setupRoutes(messageService);
        this.messageService.sendWebhookPayload({code: "bar"});
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  private async setupMessageService(options: RabbitmqServiceConfig): Promise<MessageService> {
    return new Promise(async (resolve, reject) => {
      try {
        const service = await MessageService.create(options);
        resolve(service);
      } catch (error) {
        reject(error);
      }
    })
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
const port = '3000'; // Specify your desired port number
// @ts-ignore
// const server = new Server(port);
const rabbitmqServiceConfig = {
  user: {
    username: process.env.RABBITMQ_GATEWAY_USER || "",
    password: process.env.RABBITMQ_GATEWAY_PASSWD || "",
  },
  // Might be 'rabbitmq' in the future, defined in our docker network as such
  hostname: 'localhost',
  port: process.env.RABBITMQ_PORT || "5672"
}

// @ts-ignore
const server = GatewayServer.create({ rabbitmqServiceConfig, port});

// server.startServer().catch((error) => {
//   console.error("Failed to start the server:", error);
//   process.exit(1); // Terminate the process if the server fails to start
// });
