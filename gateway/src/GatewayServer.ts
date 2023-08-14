import dotenv from "dotenv";
import { RabbitmqServiceConfig } from "./RabbitmqService"; // Importing our abstraction class
import { MessageService } from "./MessageService";
import { ExpressApp } from './ExpressApp';
import { Express } from 'express'
import createWebhookRouter from './webhookRouter';

dotenv.config()

export interface GatewayServerConfig {
    rabbitmqServiceConfig: RabbitmqServiceConfig;
    port: string;
}

export interface GatewayServerTools {
    expressApp: ExpressApp;
    rabbitmq: MessageService;
}

export class GatewayServer {
    // @ts-ignore
    private expressApp: ExpressApp;
    // @ts-ignore
    private rabbitmq: MessageService;

    // A Gateway Server needs this to function
    constructor(config: GatewayServerTools) {
        this.expressApp = config.expressApp;
        this.rabbitmq = config.rabbitmq;
    }

    // Creates an instance of this server
    static async create(options: GatewayServerConfig): Promise<GatewayServer> {
        const config = await this.init(options);
        const instance = new GatewayServer(config);
        return instance;
    }

    // initializes a set of server creation tools
    // Boots the server's services
    // Returns an object containing the references to the server's setup tools
    static async init(options: GatewayServerConfig): Promise<GatewayServerTools> {
        return new Promise(async (resolve, reject) => {
            try {
                // MessageService
                const rabbitmq = await MessageService.create(options.rabbitmqServiceConfig);

                // Express App with MessageService capability
                const expressApp = new ExpressApp({ port: options.port, setupRoutes: (app: Express) => {
                    // Here we declare and use one router, but in the future, maybe declare a router here
                    // But define the sub-router splitting code there
                    const webhookRouter = createWebhookRouter(rabbitmq);
                    app.use(webhookRouter);
                }});

                expressApp.start();

                const completedSetup = {
                    expressApp,
                    rabbitmq
                }
                resolve(completedSetup);
            } catch (error) {
                reject(error);
            }
        })
    }
}