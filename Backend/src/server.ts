import fs from "fs";
import https from "https";
import path from "path";
import cookie from "cookie";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Client, GatewayIntentBits } from "discord.js";
import express from "express";
import fetch from "node-fetch";
import { Server } from "socket.io";

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

// Express Logic section
// app handles the construction of the API server and the websocket server
const app = express();
const port = 3000;

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
    const redirect_uri = "https://localhost:3000/auth/callback";
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
      // try {
      //   const testClient = new Client(options);
      //   await testClient.login(data.access_token);
      // } catch (error) {
      //   console.log("Testing client login at first token", error);
      // }
      // @ts-ignore
      const { access_token, token_type, expires_in, refresh_token } = data;
      // Set the access token in a cookie
      // secure: false => true when HTTP is upgraded to HTTPS
      res.setHeader("Set-Cookie", [
        cookie.serialize("access_token", access_token, {
          httpOnly: true,
          secure: true,
          maxAge: expires_in,
          path: "/",
        }),
        cookie.serialize("refresh_token", refresh_token, {
          httpOnly: true,
          secure: true,
          maxAge: expires_in,
          path: "/",
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

    // Send request to users/@me to verify token
    // Once verified, refresh the token
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
            "https://discord.com/api/v10/oauth2/token",
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
            console.log("Refreshed Data", refreshData);
            // Set the access token in a cookie
            // secure: false => true when HTTP is upgraded to HTTPS
            res.setHeader("Set-Cookie", [
              cookie.serialize("access_token", refreshData.access_token, {
                httpOnly: true,
                secure: true,
                maxAge: refreshData.expires_in,
                path: "/",
              }),
              cookie.serialize("refresh_token", refreshData.refresh_token, {
                httpOnly: true,
                secure: true,
                maxAge: refreshData.expires_in,
                path: "/",
              }),
            ]);
          } else {
            throw new Error(
              `Failed to Refresh Token: ${refreshResponse.statusText}`,
            );
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

// Setup certificate for server
const certDir = path.join(__dirname, "../../certs"); // Go up one level to the 'certs' directory
const certificatePath = path.join(certDir, "server-cert.pem");
const privateKeyPath = path.join(certDir, "server-key.pem");

// Start the Express server
const httpsOptions = {
  key: fs.readFileSync(privateKeyPath),
  cert: fs.readFileSync(certificatePath),
};

const server = https.createServer(httpsOptions, app);

// Websocket Logic section
// websocket will use the same port as Express server and initializes on top of it.
// websocket activates when an HTTP request is read as a Websocket request and switches to the websocket server.

// const server = https.createServer(httpsOptions, app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    credentials: true,
  },
  cookie: true,
});

// Custom Module declaration used for declarative merging used for including the access_token to the object.
declare module "socket.io" {
  interface Socket {
    access_token: string;
  }
}
io.use(async (socket, next) => {
  console.log("Socket Connection request", socket.id);
  const cookies = cookie.parse(socket.request.headers.cookie || "");
  console.log(`Socket ${socket.id} cookies`, cookies);
  const access_token = cookies.access_token || "";
  if (access_token === "") {
    console.log("Socket access token is not present");
    socket.emit("invalid_access_token", "Access token not present");
    return;
  } else {
    socket.access_token = access_token;
  }

  // Initiate log in
  try {
    console.log("Discord Client logging in", access_token);
    return next();
  } catch (error) {
    console.log("Discord Client failed login", error);
    socket.emit("invalid_access_token", "Access token is invalid");
    return;
  }
});

// // Define a connection event handler for Socket.IO
// io.on("connection", (socket) => {
//   console.log(socket.request.headers);
//   const cookies = cookie.parse(socket.request.headers.cookie || "");
//   const access_token = cookies.access_token || "";

//   console.log("socket cookies", cookies, access_token);

//   // Send a system message to the connected user
//   socket.emit(
//     "system_message",
//     `Welcome to the server ${socket.conn.transport.name}`,
//   );

//   // Create logic for creating data and send it here

//   // Handle receiving data from the client
//   socket.on("client_data", (data) => {
//     console.log("Received data from the client:", data);
//     // You can process the received data here and send a response if needed
//     socket.emit("server_response", "Data received on the server");
//   });

//   // Handle user disconnection
//   socket.on("disconnect", () => {
//     console.log("A user disconnected");
//   });
// });

server.listen(port, () => {
  console.log(`Express & Websocket server is running on port ${port}`);
});
