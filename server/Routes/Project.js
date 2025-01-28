import express from 'express';
import { createProject } from "../Controller/StoreProject"
import { updateFileCode } from "../Controller/UpdateProject"
const router = express.Router();

// Route to create a project with files
router.post('/create-project', createProject);
router.put('/update-project', updateFileCode);

export default router;
