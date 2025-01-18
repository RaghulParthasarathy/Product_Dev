import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getResponse } from "./promptHandler.js";
import { geminiModel } from "./config/genaimodel.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 9000;

app.get("/generate", async (req, res) => {
  // const prompt = req.body.prompt;

  const prompts = [
    "Create a to-do app in react",
    "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
  ];

  const combinedPrompt = prompts.join("\n");

  const result = await geminiModel.generateContent(combinedPrompt);
  const answer = (result.response.text());
  if (answer == "react\n") {
    console.log(answer);
  }

  // if (answer === "node") {
  //   console.log(answer);
  // }

  res.status(403).json({ message: "You can't access this" });
  return;

  // let history = [];

  // try {
  //   res.setHeader("Content-Type", "text/event-stream");
  //   res.setHeader("Cache-Control", "no-cache");
  //   res.setHeader("Connection", "keep-alive");

  //   console.log("Starting to generate response...");

  //   const answer = await getResponse(combinedPrompt, res, history);
  //   console.log(answer);

  //   res.end();

  // } catch (error) {
  //   console.error("Error generating response:", error.message);
  //   // Ensure that no other response is sent once streaming has started
  //   if (!res.headersSent) {
  //     res.status(500).json({ error: "Failed to generate response" });
  //   }
  // }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
