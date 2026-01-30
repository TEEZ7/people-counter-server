const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 10000;
const LINE_TOKEN = process.env.LINE_TOKEN;

// ตัวอย่างจำนวนคน (สมมติ)
let peopleCount = 5;

// Webhook จาก LINE
app.post("/webhook", async (req, res) => {
  const event = req.body.events[0];
  const replyToken = event.replyToken;

  // ถ้าผู้ใช้พิมพ์หรือกดปุ่ม
  if (event.type === "message" && event.message.type === "text") {
    const userMessage = event.message.text;

    if (userMessage === "#จำนวณตอนนี้") {
      await replyText(replyToken, `ตอนนี้มีผู้เข้าใช้ห้องสมุด ${peopleCount} คน`);
    } else {
      // ส่งปุ่มกลับไป
      await replyFlex(replyToken);
    }
  }

  res.sendStatus(200);
});

// ฟังก์ชันส่งข้อความธรรมดา
async function replyText(replyToken, text) {
  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [{ type: "text", text }],
    },
    {
      headers: {
        Authorization: `Bearer ${LINE_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

// ฟังก์ชันส่งปุ่ม (Flex Message)
async function replyFlex(replyToken) {
  const flexMessage = {
    type: "flex",
    altText: "เมนู",
    contents: {
      type: "bubble",
      hero: {
        type: "image",
        url: "https://i.imgur.com/7yUvePI.png",
        size: "full",
        aspectRatio: "1:1",
        aspectMode: "cover",
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "ระบบนับจำนวนคน",
            weight: "bold",
            size: "lg",
          },
          {
            type: "button",
            style: "primary",
            action: {
              type: "message",
              label: "ดูจำนวนคน",
              text: "ดูจำนวนคน",
            },
          },
        ],
      },
    },
  };

  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [flexMessage],
    },
    {
      headers: {
        Authorization: `Bearer ${LINE_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
