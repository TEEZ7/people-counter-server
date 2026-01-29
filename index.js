const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

const LINE_TOKEN = process.env.LINE_TOKEN;

// เก็บจำนวนคนล่าสุด
let latestPeople = 0;

// ESP8266 จะส่งจำนวนคนมาที่นี่
app.post("/update", (req, res) => {
  const people = req.body.people;
  if (people === undefined) {
    return res.status(400).send("Missing people count");
  }

  latestPeople = people;
  console.log("Updated people count:", latestPeople);
  res.send("OK");
});

// LINE จะเรียก webhook มาที่นี่เมื่อผู้ใช้กดปุ่มหรือพิมพ์ข้อความ
app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  if (!events || events.length === 0) {
    return res.sendStatus(200);
  }

  const event = events[0];
  const replyToken = event.replyToken;

  let replyText = "";

  if (event.type === "message" && event.message.type === "text") {
    const userMessage = event.message.text;

    if (userMessage === "status") {
      replyText = `📊 ตอนนี้มีคนอยู่ในห้อง: ${latestPeople} คน`;
    } else {
      replyText = "กดปุ่มเพื่อดูจำนวนคนในห้องครับ 😊";
    }
  }

  const replyMessage = {
    replyToken: replyToken,
    messages: [
      {
        type: "text",
        text: replyText,
      },
    ],
  };

  try {
    await axios.post("https://api.line.me/v2/bot/message/reply", replyMessage, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LINE_TOKEN}`,
      },
    });
    res.sendStatus(200);
  } catch (error) {
    console.error("LINE API error:", error.response?.data || error.message);
    res.sendStatus(500);
  }
});

// หน้าเว็บทดสอบ
app.get("/", (req, res) => {
  res.send("People Counter LINE Bot Server is running 🚀");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
