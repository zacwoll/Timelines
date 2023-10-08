// It's that time of year again. The time of year I create a random server class and build some bullshit that I eventually forget lmao!

import { Client, GatewayIntentBits } from "discord.js";
import express from "express";
import { Response } from "express-serve-static-core";
const app = express();
const port = 3000;

// Configure the options object
const options = {
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
};

// Create a Discord.js client
const discordClient = new Client(options);

// Middleware to parse JSON request bodies
app.use(express.json());

// Endpoint to launch data streaming
app.post("/streaming/launch", (req, res) => {
  // Retrieve the access token from the request
  const { accessToken } = req.body;

  // Verify the access token if needed (e.g., by making a request to Discord's API)

  // Log in the Discord.js client with the access token
  discordClient
    .login(accessToken)
    .then(() => {
      // Once the client is logged in, retrieve guild message data, process it, and stream it back
      void retrieveAndProcessData(accessToken, res);
    })
    .catch((error) => {
      console.error("Discord.js login failed:", error);
      res.status(500).json({ error: "Discord.js login failed" });
    });
});

// Function to retrieve and process data
async function retrieveAndProcessData(
  // @ts-ignore
  accessToken: string,
  response: Response<any, Record<string, any>, number>,
) {
  try {
    // Gather data from user's guilds using Discord.js
    const guildData = await gatherGuildData();

    // Process the gathered data (replace with your processing logic)
    const processedData = processGuildData(guildData);

    // Stream processed data back to the user
    // This part depends on how you want to stream data back to the user
    // You might consider using WebSockets or another real-time communication method

    // For simplicity, we'll send back a JSON response
    response.json({
      message: "Data streaming initiated successfully",
      data: processedData,
    });
  } catch (error) {
    console.error("Error retrieving or processing data:", error);
    response.status(500).json({ error: "Error retrieving or processing data" });
  }
}

type GuildData = {
  [guildId: string]: any;
};

// Function to gather data from user's guilds using Discord.js
async function gatherGuildData() {
  const allGuildData: GuildData = {};

  // Iterate through the guilds where the bot is a member
  for (const guild of discordClient.guilds.cache.values()) {
    const guildData = guild;
    // Retrieve and store data from each guild (e.g., latest messages, member data, etc.)
    // Add your logic here to gather the necessary data
    // You can use guild.channels, guild.members, etc. to access guild data
    allGuildData[guild.id] = guildData;
  }

  return allGuildData;
}

// Function to process gathered guild data (replace with your processing logic)
function processGuildData(
  // @ts-ignore
  guildData: any,
) {
  // Replace this with your processing logic
  return /* Processed data */;
}

// Start the Express server
app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});
