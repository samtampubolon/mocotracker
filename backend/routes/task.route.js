import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import {
    getTasks,
    createTask,
    updateTask,
    deleteTask
} from '../controllers/task.controller.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'recording-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Get all tasks
router.get('/', getTasks);

// Create a new task with file upload
router.post('/', upload.single('recording'), createTask);

// Update a task with file upload
router.patch('/:id', upload.single('recording'), updateTask);

// Delete a task
router.delete('/:id', deleteTask);

export default router;