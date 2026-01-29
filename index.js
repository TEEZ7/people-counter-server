const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 10000;
const CHANNEL_ACCESS_TOKEN = process.env.CHANNEL_ACCESS_TOKEN;

// ตัวแปรเก็บจำนวนคน (ตัวอย่าง)
let peopleCount = 5; // เปลี่ยนเป็นค่าจริงจากเซนเซอร์ได้ภายหลัง

app.post("/webhook", async (req, res) => {
  const events = req.body.events;
  if (!events || events.length === 0) return res.sendStatus(200);

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const userMessage = event.message.text.trim();

      if (userMessage === "ดูจำนวนคน") {
        await reply(event.replyToken, `ตอนนี้มีคนอยู่ ${peopleCount} คน`);
      }
    }
  }

  res.sendStatus(200);
});

async function reply(replyToken, message) {
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken: replyToken,
      messages: [{ type: "text", text: message }],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
    }
  );
}

app.get("/", (req, res) => {
  res.send("People Counter Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
