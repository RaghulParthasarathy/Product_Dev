import User from "../Model/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Register a new user
export const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  console.log("request received on registerUser", req.body);

  try {
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Create a new user
    const user = await User.create({ username, email, password });
    console.log("user created", user);

    res.status(201).json({ userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: "Server error, unable to register" });
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("request received on loginUser", email);
  try {
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // Set token in a secure cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    console.log("token set in cookie", token); 

    res.status(200).json({ userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json({ error: "Server error, unable to login" });
  }
};

// Get user details from token
export const getUser = async (req, res) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;
    console.log("token from cookies", token);
    if (!token) {
      console.warn("[getUser] No token found in cookies");
      return res.status(401).json({ error: "Unauthorized, token missing" });
    }

    // Verify token and extract userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    console.log("[getUser] Decoded userId:", userId);

    // Fetch user from DB
    const user = await User.findById(userId);
    if (!user) {
      console.warn("[getUser] User not found in database");
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ username: user.username, userId: user._id });
  } catch (err) {
    console.error("[getUser] Error:", err);
    res.status(500).json({ error: "Server error, unable to fetch user" });
  }
};

// // Get user details
// export const getUser = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ error: "User not found" });
//     }

//     res.status(200).json({ username: user.username });
//   } catch (err) {
//     res.status(500).json({ error: "Server error, unable to fetch user" });
//   }
// };
