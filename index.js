const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// 🔐 ใส่ Channel Access Token ของ LINE
const LINE_TOKEN = "2rbSeXk1V/XqVBbkBCmePkRJ9g9HsAD2Zz1x+xrXlbpoVny2ioY3eUS9IA1Zs+ASpTLLVCbkO9foM/kIvxptaDMl0pX/FldwO94LQ4rD0tyMj0l06101nNcntbY87U1X2gW1OwqrHdjdkfIpr1nWkgdB04t89/1O/w1cDnyilFU=";

// เก็บจำนวนคนล่าสุดจาก ESP8266
let people = 0;

// 📡 รับค่าจำนวนคนจาก ESP8266
app.post("/update", (req, res) => {
  const { count } = req.body;

  if (typeof count === "number") {
    people = count;
    console.log("Updated people count:", people);
    res.send({ status: "ok", people });
  } else {
    res.status(400).send({ status: "error", message: "Invalid count" });
  }
});

// 🤖 รับ webhook จาก LINE
app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const text = event.message.text;

      if (text === "#จำนวณคนตอนนี้") {
        const replyToken = event.replyToken;

        const replyMessage = {
          replyToken: replyToken,
          messages: [
            {
              type: "text",
              text: `ตอนนี้มีคนอยู่ ${people} คน`,
            },
          ],
        };

        await axios.post(
          "https://api.line.me/v2/bot/message/reply",
          replyMessage,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${LINE_TOKEN}`,
            },
          }
        );
      }
    }
  }

  res.sendStatus(200);
});

// หน้าเว็บทดสอบ
app.get("/", (req, res) => {
  res.send("People Counter Server is running!");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
