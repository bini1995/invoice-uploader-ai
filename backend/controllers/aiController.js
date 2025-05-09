// backend/controllers/aiController.js
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = require('../config/openai');

console.log('🔧 AI Controller loaded');


exports.summarizeUploadErrors = async (req, res) => {
  try {
    const { errors } = req.body;

    if (!errors || !Array.isArray(errors)) {
      return res.status(400).json({ message: "Missing or invalid errors array." });
    }

    const errorText = errors.join("\n");
    const prompt = `Summarize these CSV upload errors in plain English for a user:\n${errorText}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",  // <-- use this instead of gpt-4
      messages: [
        { role: "system", content: "You are a helpful assistant that summarizes upload errors." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    res.json({ summary });
  } catch (error) {
    console.error("AI summary error:", error);
    res.status(500).json({ message: "Failed to generate AI summary." });
  }
};
