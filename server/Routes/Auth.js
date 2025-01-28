import { Router } from 'express';
import { signup } from "../Controller/Auth";
const router = Router();

router.post('/signup', signup);

module.exports = router;
