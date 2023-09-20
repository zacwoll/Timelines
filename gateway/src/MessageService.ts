import { RabbitmqServiceConfig, RabbitmqService } from "./RabbitmqService";
import amqp, { ConsumeMessage } from "amqplib";

interface webhookPayload {
    code: string
}

interface MessageServiceConfig {
    webhookChannel: amqp.Channel,
    webhookQueue: amqp.Replies.AssertQueue
}

export class MessageService {
    private webhookChannel: amqp.Channel;
    private webhookQueue: amqp.Replies.AssertQueue;

    constructor(config: MessageServiceConfig) {
        this.webhookChannel = config.webhookChannel;
        this.webhookQueue = config.webhookQueue;
    }

    static async create(options: RabbitmqServiceConfig): Promise<MessageService> {
        const config = await this.init(options);
        const instance = new MessageService(config);
        return instance;
    }

    public sendWebhookPayload(payload: webhookPayload) {
        try {
            this.webhookChannel.sendToQueue(this.webhookQueue.queue || 'webhook_queue', Buffer.from(`${payload.code}`));
        } catch (error) {
            console.log(error);
        }
    }

    static async init(options: RabbitmqServiceConfig): Promise<MessageServiceConfig> {
        return new Promise(async (resolve, reject) => {
            try {
                // Create connection to RabbitMQ
                const rabbitmq = await this.setupConnection(options);
                
                // Create Channel + Queue
                const webhookChannel = await this.createChannel(rabbitmq);

                const webhookQueue = await this.createWebhookStream(webhookChannel);
        
                const initializedService = { webhookChannel, webhookQueue };
                resolve(initializedService);
            } catch (error) {
                reject(error);
            }
        })
    }

    // Sets up a consumer for the auth exchange
    public async setupWebhookConsumer(): Promise<amqp.Replies.Consume> {
        return new Promise((resolve, reject) => {
        try {
            let consumerTag = this.webhookChannel.consume(
                this.webhookQueue.queue || "",
                (msg: ConsumeMessage | null) => {
                    if (msg) {
                    console.log(`Received message: ${msg.content.toString()}`);
                    // Process message here
                    this.webhookChannel.ack(msg); // Acknowledge message
                    } else {
                    console.log("${msg} is null");
                    }
                }
                );
            resolve(consumerTag);
        } catch (err) {
            reject(err);
        }
        });
    }

    static async setupConnection(options: RabbitmqServiceConfig): Promise<RabbitmqService> {
        return new Promise(async (resolve, reject) => {
            try {
                const service = new RabbitmqService(options);
                await service.connect();
                resolve(service);               
            } catch(error) {
                reject(error);
            }
        });
    }

    static async createChannel(rabbitmq: RabbitmqService): Promise<amqp.Channel> {
        return new Promise(async (resolve, reject) => {
            try {
                const channel = await rabbitmq.createChannel();
                channel.prefetch(1);
                resolve(channel);
            } catch (error) {
                reject(error);
            }
        })
    }

    static async createWebhookStream(authChannel: amqp.Channel): Promise<amqp.Replies.AssertQueue> {
        return new Promise(async (resolve, reject) => {
          try {
            // Create the auth queue 
            console.log("Setting up webhook queue");
            const webhookQueueName = "webhook_queue";

            // Assert the auth queue
            // Queue (Stream)
            const webhookQueue = await authChannel.assertQueue(webhookQueueName, {
              durable: true,
              arguments: {
                "x-queue-type": "stream",
                // 'exclusive': 'false'
              },
            });
            resolve(webhookQueue);
          } catch (error) {
            reject(error);
          }
        });
      }

}

