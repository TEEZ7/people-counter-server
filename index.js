const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const LINE_TOKEN = process.env.LINE_TOKEN;
const LINE_USER_ID = process.env.LINE_USER_ID;

app.post("/update", async (req, res) => {
  const { people } = req.body;

  if (people === undefined) {
    return res.status(400).send("Missing people count");
  }

  const message = {
    to: LINE_USER_ID,
    messages: [
      {
        type: "text",
        text: `📢 จำนวนคนในห้องตอนนี้: ${people} คน`
      }
    ]
  };

  try {
    await axios.post("https://api.line.me/v2/bot/message/push", message, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LINE_TOKEN}`
      }
    });
    res.send("Message sent to LINE");
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send("Failed to send LINE message");
  }
});

app.get("/", (req, res) => {
  res.send("LINE Bot Server is running 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
