import { Server as HTTPServer } from "http";
import express, { Express } from "express";

export class Server {
  private app: Express;
  private port: number;
  private server?: HTTPServer;
  private setupComplete: Promise<void>;
  private isReadyForConnections: boolean;

  constructor(port: number) {
    this.app = express();
    this.port = port;
    this.setupComplete = this.setup();
    this.isReadyForConnections = false;
    void this.start();
  }

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

  // setup function that runs all setup necessities
  private async setup(): Promise<void> {
    return new Promise((resolve) => {
      this.setupRoutes();
      resolve();
    });
  }

  // Open for connections
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

  public async pause() {
    if (this.server) {
      this.server.close();
      console.log("Server paused");
    }
  }

  public async resume() {
    await this.setupComplete;
    await this.listen();
  }

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
          } else {
            console.log("Not ready yet");
          }
        }, 100);
      }
    });
  }
}
