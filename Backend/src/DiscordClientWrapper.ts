import { Client, GatewayIntentBits } from "discord.js";
import { Authorization, DiscordAuthInterface } from "./DiscordClientAuth";

// TODO: Needs new method to call that logs the bot in

export class DiscordClientWrapper {
  // variables
  // @ts-ignore
  public client: Client;
  public auth: Authorization;

  constructor(bot_credentials: DiscordAuthInterface) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildEmojisAndStickers,
        GatewayIntentBits.MessageContent,
      ],
    });
    this.auth = new Authorization(bot_credentials);
  }

  public getClient(): Client {
    return this.client;
  }

  public getClientAuth(): Authorization {
    return this.auth;
  }

  public async login(bot_token: string) {
    try {
      await this.client.login(bot_token);
      // The login was successful, you can perform any post-login logic here
    } catch (error) {
      // Handle any login errors here
      console.error("Login failed:", error);
    }
  }

  // async login(botToken: string, code: string, guildId: string) {
  //     const accessToken = await this.authorization.getAccessToken(code);

  //     await this.client.login(botToken);
  //     await this.client.guilds.cache.get(guildId)?.members.fetch();
  //     await this.client.guilds.cache.get(guildId)?.members.add(this.client.user?.id as string, {
  //       accessToken,
  //       roles: [],
  //     });

  //     console.log(`Added bot to server ${guildId}`);
  //   }
}
