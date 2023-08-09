import amqp, { ConsumeMessage, Replies } from "amqplib";

export interface ConnectionOptions {
    username: string;
    password: string;
    hostname: string;
    port: string;
    vhost?: string;
  }

export class RabbitmqService {
    private connection: amqp.Connection | null = null;
    private channels: amqp.Channel[] = [];
  
    constructor(private options: ConnectionOptions) {

    }
  
    public async connect(): Promise<void> {
        const { username, password, hostname, port } = this.options;
        const vhost = this.options.vhost ? `/${this.options.vhost}` : '';
        const connectionUrl = `amqp://${username}:${password}@${hostname}:${port}${vhost}`;
        this.connection = await amqp.connect(connectionUrl);
    }
  
    public async createChannel(): Promise<amqp.Channel> {
      if (!this.connection) throw new Error('Connection is not initialized');
      const channel = await this.connection.createChannel();
      this.channels.push(channel);
      return channel;
    }

    public async createQueue(channel: amqp.Channel, queue: string, options?: amqp.Options.AssertQueue): Promise<void> {
        await channel.assertQueue(queue, options);
    }

    public async sendMessage(channel: amqp.Channel, queue: string, message: string, options?: amqp.Options.Publish): Promise<void> {
        channel.sendToQueue(queue, Buffer.from(message), options);
    }

    public async consume(channel: amqp.Channel, queue: string, onMessage: (msg: ConsumeMessage | null) => void, options?: amqp.Options.Consume): Promise<string> {
        const { consumerTag } = await channel.consume(queue, onMessage, options);
        return consumerTag;
    }

    public async setPrefetch(channel: amqp.Channel, count: number, global: boolean = false): Promise<void> {
        await channel.prefetch(count, global);
    }

    public async deleteQueue(channel: amqp.Channel, queue: string, options?: amqp.Options.DeleteQueue): Promise<Replies.DeleteQueue> {
        return await channel.deleteQueue(queue, options);
    }

    public async bindQueue(channel: amqp.Channel, queue: string, exchange: string, pattern: string, args?: any): Promise<Replies.Empty> {
        return await channel.bindQueue(queue, exchange, pattern, args);
    }

    public async unbindQueue(channel: amqp.Channel, queue: string, exchange: string, pattern: string, args?: any): Promise<Replies.Empty> {
        return await channel.unbindQueue(queue, exchange, pattern, args);
    }
    
    public async close(): Promise<void> {
        await Promise.all(this.channels.map((channel) => channel.close()));
        if (this.connection) {
            await this.connection.close();
        }
    }
}