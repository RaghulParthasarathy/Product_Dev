import { Router } from "express";
import { registerUser, loginUser, getUser } from "../controller/Auth.js";

const router = Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.get("/user", getUser);

export default router;
