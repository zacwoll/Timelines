import express from 'express';
import { MessageService } from 'MessageService';

const createWebhookRouter = (rabbitmq: MessageService) => {
    const webhookRouter = express.Router();

    webhookRouter.post("/webhook", (req, res) => {
        // Body params
      const code = req.body.code;
      const guildId = req.body.guildId;

      // Print to console
      console.log(`Authorization code: ${code}`);
      console.log(`Guild ID: ${guildId}`);

      rabbitmq.sendWebhookPayload({guildId, code});

      res.status(200).send(`${guildId}: ${code} received`);
    });

    return webhookRouter
}

export default createWebhookRouter;
