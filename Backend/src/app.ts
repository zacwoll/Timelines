import dotenv from "dotenv";
import { DiscordClientWrapper } from "./DiscordClientWrapper";
import { Events } from "discord.js";

dotenv.config();

// // Demo Code: Instantiate the server and start it

const redirect_uri = process.env.REDIRECT_URI || "http://localhost";
const AUTH_SCOPES = ["bot"];

const botConfig = {
    loginToken: process.env.DISCORD_PUBLIC_KEY || "",
    clientId: process.env.DISCORD_CLIENT_ID || "",
    clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    redirectUri: redirect_uri,
    scopes: AUTH_SCOPES
}
console.log(`Discord Bot Config: \n${JSON.stringify(botConfig, null, 2)}`);

// Create the Discord Client
const app = new DiscordClientWrapper(botConfig);

// Get the Client part
const client = app.getClient();

// Set up on-ready, on-message, and on-error

client.on('ready', () => {
    const username = client.user?.tag;
    console.log(`Client is Ready, signed in as ${username}`);
});

client.on('error', () => {
    console.error('Client has errored');
});

// Messages are read in, and printed to console.
// Save the messages in a queue and push them out via http?
client.on(Events.MessageCreate, (message) => {
    const { content, author, channel, guild } = message;

    console.log(`Content: ${content.toString()}
Author: ${author.tag}
Channel: ${channel}
Guild: ${guild ? guild.name : 'Direct Message'}`)
    console.log(message);
});

app.login(botConfig.loginToken);