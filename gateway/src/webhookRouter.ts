import express from 'express';
import { MessageService } from 'MessageService';

const createWebhookRouter = (rabbitmq: MessageService) => {
    const webhookRouter = express.Router();

    webhookRouter.get("/redirect_uri", (req, res) => {
      if (req && req.query && req.query.code) {
        // Body params
        const code = req.query.code.toString();
        // const guildId = req.body.guildId;

        // Print to console
        console.log(`Authorization code: ${code}`);

        rabbitmq.sendWebhookPayload({code});

        res.status(200).send(`code: ${code}`);
      }

    });

    webhookRouter.get("/access_token", (req, res) => {
      if (req) {
        const access_token = "ACCESS_TOKEN";
        // rabbitmq.sendWebhookPayload({});
        res.status(200).send(`access_token: ${access_token}`);
      }
    })

    return webhookRouter
}

export default createWebhookRouter;
