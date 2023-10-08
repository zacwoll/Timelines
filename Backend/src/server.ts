// It's that time of year again. The time of year I create a random server class and build some bullshit that I eventually forget lmao!

import cookie from "cookie";
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

app.get("/auth/callback", async (req, res) => {
  console.log("Visitor at /auth/callback");
  try {
    const code = req.query.code?.toString() || ""; // Get the 'code' query parameter from the request
    const redirect_uri = "localhost:3000/auth/set_cookies";
    const client_id = process.env.CLIENT_ID || "";
    const client_secret = process.env.CLIENT_SECRET || "";
    if (client_id === "" || client_secret === "") {
      console.log("No ENV detected");
      res.status(500).send("Internal Server Error");
    } else if (!code) {
      res.status(400).send("No Code provided");
    }

    // Make a POST request to the Discord Token authenticator
    const response = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri, // Replace with your redirect URI
        client_id, // Retrieve client ID from environment variable
        client_secret, // Retrieve client secret from environment variable
      }),
    });
    if (response.ok) {
      const data = await response.json();
      // @ts-ignore
      const { access_token, token_type, expires_in, refresh_token } = data;
      // Set the access token in a cookie
      res.setHeader("Set-Cookie", [
        cookie.serialize("access_token", access_token, {
          httpOnly: true,
        }),
        cookie.serialize("refresh_token", refresh_token, {
          httpOnly: true,
        }),
        cookie.serialize("expires_in", expires_in, {
          httpOnly: true,
        }),
      ]);

      res.status(200).send("Authentication successful");
    } else {
      console.error(
        "Error exchanging code for token:",
        response.status,
        response.statusText,
      );
      res.status(500).send("Internal Server Error");
    }
  } catch (error) {
    console.error("Error handling authentication callback:", error);
    res.status(500).send("Internal Server Error");
  }
});

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
