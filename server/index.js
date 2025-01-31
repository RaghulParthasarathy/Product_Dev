import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import { BASE_PROMPT, getSystemPrompt } from "./prompts.js";
import { basePrompt as nodeBasePrompt } from "./src/defaults/node.js";
import { basePrompt as reactBasePrompt } from "./src/defaults/react.js";
import authRoutes from "./Routes/Auth.js";
import projectRoutes from "./Routes/Project.js";
import cors from "cors";
dotenv.config();
import connectToDb from "./config/db_config.js";

const app = express();
const port = 5001;


const corsOptions = {
  origin: "*", 
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization"
};

app.use(cors(corsOptions));

// const allowedOrigins = ['http://localhost:3000', 'http://localhost:5174', 'http://localhost:5173'];

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true, // Allow cookies/auth headers if needed
// }));

app.use(express.json());

////////////

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function listModels() {
  try {
    const models = await openai.models.list();
    console.log("Available Models:", models);
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}

// listModels();



async function main() {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "o1-mini",
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

  const combinedPrompt = `${prompt}\nReturn either 'node' or 'react' based on what you think this project should be. Only return a single word either 'node' or 'react'.`;
  console.log(combinedPrompt);
  try {
    // const result = await openai.chat.completions.create({
    //   model: "gpt-4o-mini",
    //   messages: [{ role: "user", content: combinedPrompt }],
    // });

    const answer = "react";
    console.log(answer);
    if (answer === "react") {
      console.log("React project");
      res.json({
        prompts: [
          BASE_PROMPT,
          `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
        ],
        uiPrompts: [reactBasePrompt],
      });
      return;
    }

    // if (answer === "node") {
    //   res.json({
    //     prompts: [
    //       `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${nodeBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
    //     ],
    //     uiPrompts: [nodeBasePrompt],
    //   });
    //   return;
    // }

    // res.status(403).json({ message: "You can't access this" });
  } catch (error) {
    console.error("Error generating response:", error.message);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

app.post("/api/v1/chat/", async (req, res) => {
  const messages = req.body.messages;
  const systemPrompt = getSystemPrompt();

  const combinedMessages = [{ role: "system", content: systemPrompt }, ...messages];

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: combinedMessages,
    });

    res.json({ response: result.choices[0].message.content });
  } catch (error) {
    console.error("Error generating content:", error.message);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

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
