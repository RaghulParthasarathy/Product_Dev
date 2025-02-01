import express from "express";
import dotenv from "dotenv";
import { geminiModel } from "./config/genaimodel.js";
import { BASE_PROMPT, getSystemPrompt } from "./prompts.js";
import { basePrompt as nodeBasePrompt } from "./src/defaults/node.js";
import { basePrompt as reactBasePrompt } from "./src/defaults/react.js";
import authRoutes from "./Routes/Auth.js"
import projectRoutes from "./Routes/Project.js"
import cors from "cors";
dotenv.config();
import connectToDb from "./config/db_config.js";
import OpenAI from "openai";

const app = express();
const port = 5001;

const corsOptions = {
  origin: "*", 
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization"
};

app.use(cors(corsOptions));

app.use(express.json());

////////////

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "What is ChatGPT and write something about India?" },
      ],
    });

    console.log(chatCompletion.choices[0].message.content);
  } catch (error) {
    console.error("Error:", error);
  }
}

// main();

////////////

app.post("/api/v1/template", async (req, res) => {
  const prompt = req.body.prompt;
  console.log(prompt);

  const prompts = [
    prompt ,
    "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra",
  ];

  const combinedPrompt = prompts.join("\n");
  console.log("Combined prompt is : ",combinedPrompt);

  console.log("Combined prompt is : ",combinedPrompt);

  try {
    const result = await geminiModel.generateContent(combinedPrompt);
    const answer = result.response.text().trim(); // Ensure trimmed output for comparison
    if (answer === "react") {
    console.log("Answer is : ",answer);

      res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [reactBasePrompt],
      });
      return;
    }

    if (answer === "node") {
      res.json({
        prompts: [
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [nodeBasePrompt],
      });
      return;
    }

    res.status(403).json({ message: "You can't access this" });
  } catch (error) {
    console.error("Error generating response:", error.message);
    res.status(500).json({ error: "Failed to generate response" });
  }

  

  })

  app.post("/api/v1/chat/", async (req, res) => {
    const messages = req.body.messages;
    console.log("Messages received:", messages);
  
    // Extract the content from each message and combine them
    const combinedPrompt = messages.map(msg => msg.content).join("\n") + "\n\n" +
        "You should respond in the below format only, and do NOT add any extra text, " +
        "explanations, or code blocks like ```javascript. Just return the content exactly as requested:\n\n" +
        `Here is an artifact that contains all files of the project visible to you.
Consider the contents of ALL files in the project.

<boltArtifact id="project-import" title="Project Files">

<boltAction type="file" filePath="public/index.html">
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
</boltAction>
</boltArtifact>`;

    console.log("Final Combined Prompt is:", combinedPrompt);
  
    try {
        const result = await geminiModel.generateContent(combinedPrompt);
        const responseText = await result.response.text();
        
        console.log("Generated response:", responseText);
        res.json({ response: responseText });
    } catch (error) {
        console.error("Error generating content:", error.message);
        res.status(500).json({ error: "Failed to generate content" });
    }
});

  
  

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
// });

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/project', projectRoutes);

const start = async () => {
  try {
    await connectToDb(process.env.MONGO_URI);
    console.log("Database connected successfully!");

    app.listen(port, async () => {
      console.log(`Server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();