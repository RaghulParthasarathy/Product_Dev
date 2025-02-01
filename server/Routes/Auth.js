import { Router } from "express";
import { registerUser, loginUser, getUser } from "../controller/Auth.js";
import authenticateUser from "../middleware/user.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/user",authenticateUser, getUser);

export default router;