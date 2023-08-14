import dotenv from "dotenv";
import { GatewayServer } from "./GatewayServer";

dotenv.config();

// // Demo Code: Instantiate the server and start it

const port = process.env.PORT || '3000'; // Specify your desired port number
const rabbitmqServiceConfig = {
  user: {
    username: process.env.RABBITMQ_GATEWAY_USER || "",
    password: process.env.RABBITMQ_GATEWAY_PASSWD || "",
  },
  // Might be 'rabbitmq' in the future, defined in our docker network as such
  hostname: 'localhost',
  port: process.env.RABBITMQ_PORT || "5672"
}

// @ts-ignore
const server = GatewayServer.create({ rabbitmqServiceConfig, port});
