import cookie from "cookie";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Client, GatewayIntentBits } from "discord.js";
import express from "express";
import fetch from "node-fetch";
const app = express();
const port = 3000;
import "dotenv/config";

const { CLIENT_ID, CLIENT_SECRET } = process.env;

// Configure the client options object
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
// configure cors to accept requests from FE
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  }),
);
// app.use(cors());
app.use(cookieParser());

// Endpoint to receive auth callbacks and install cookies
app.get("/auth/callback", async (req, res) => {
  console.log("Visitor at /auth/callback");
  try {
    const code = req.query.code?.toString() || ""; // Get the 'code' query parameter from the request
    const redirect_uri = "http://localhost:3000/auth/callback";
    const client_id = CLIENT_ID || "";
    const client_secret = CLIENT_SECRET || "";
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
      console.log(data);
      // @ts-ignore
      const { access_token, token_type, expires_in, refresh_token } = data;
      // Set the access token in a cookie
      // secure: false => true when HTTP is upgraded to HTTPS
      res.setHeader("Set-Cookie", [
        cookie.serialize("access_token", access_token, {
          httpOnly: true,
          secure: false,
          maxAge: expires_in,
        }),
        cookie.serialize("refresh_token", refresh_token, {
          httpOnly: true,
          secure: false,
          maxAge: expires_in,
        }),
      ]);

      res.status(200).redirect("http://localhost:4200");
    } else {
      console.error(
        "Error exchanging code for token:",
        response.status,
        response.statusText,
      );
      console.log(await response.json());
      res.status(500).send("Internal Server Error");
    }
  } catch (error) {
    console.error("Error handling authentication callback:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to verify cookie or refresh cookie
app.get("/auth/check_cookie", async (req, res) => {
  console.log("Visitor at /auth/check_cookie");
  try {
    const { access_token, refresh_token } = req.cookies;
    console.log("cookies", req.cookies);
    if (!access_token || !refresh_token) {
      console.error("Error, Cookie not found");
      res.status(400).send("Cookies not found");
      return;
    }

    try {
      // Verify Token
      const response = await fetch("https://discord.com/api/v10/users/@me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        console.log("https://discord.com/api/v10/users/@me", userData);
        try {
          // Perform token refresh (whether it expires or not)
          const refreshResponse = await fetch(
            "https://discord.com/api/v10/oauth2/token/refresh",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token,
                client_id: CLIENT_ID || "", // Retrieve client ID from environment variable
                client_secret: CLIENT_SECRET || "", // Retrieve client secret from environment variable
              }),
            },
          );
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            // Set the access token in a cookie
            // secure: false => true when HTTP is upgraded to HTTPS
            res.setHeader("Set-Cookie", [
              cookie.serialize("access_token", refreshData.access_token, {
                httpOnly: true,
                secure: false,
                maxAge: refreshData.expires_in,
              }),
              cookie.serialize("refresh_token", refresh_token, {
                httpOnly: true,
                secure: false,
                maxAge: refreshData.expires_in,
              }),
            ]);
          }
        } catch (error) {
          console.error(
            "Error Refreshing Token:",
            response.status,
            response.statusText,
          );
        }
        res.status(200).json(userData);
        return;
      }
    } catch (error) {
      console.error("Error verifying token:");
      res.sendStatus(401).send("Unauthorized");
    }
  } catch (error) {
    console.error("Error handling check_cookie: ", error);
    res.sendStatus(500).send("Internal server error");
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
    })
    .catch((error) => {
      console.error("Discord.js login failed:", error);
      res.status(500).json({ error: "Discord.js login failed" });
    });
});

// Start the Express server
app.listen(port, () => {
  console.log(`Express server is running on port ${port}`);
});
