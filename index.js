import express from "express";

const app = express();
app.use(express.json());

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "change_me";
const DEFAULT_ALLOWED = "13233775620";
const ALLOWED_WA_ID = process.env.ALLOWED_WA_ID || DEFAULT_ALLOWED;

app.get("/whatsapp-webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post("/whatsapp-webhook", async (req, res) => {
  try {
    const entries = req.body?.entry || [];
    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const value = change?.value || {};
        const messages = value?.messages;
        if (!Array.isArray(messages) || messages.length === 0) continue;

        for (const message of messages) {
          const from = message?.from;
          if (!from || from !== ALLOWED_WA_ID) {
            continue;
          }

          console.log("Allowed message:", message?.text?.body ?? "[non-text]");
          // TODO: forward to OpenClaw dispatcher here
        }
      }
    }
    return res.sendStatus(200);
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.sendStatus(200);
  }
});

app.get("/", (_req, res) => {
  res.send("WhatsApp webhook up");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Webhook server running on port ${PORT}`));
