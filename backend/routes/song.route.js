import express from 'express';
import { createSong, getSongs, updateSong, deleteSong, reorderSongs } from '../controllers/song.controller.js';

const router = express.Router();

router.get("/", getSongs);
router.post("/", createSong);
router.put("/:id", updateSong);
router.delete("/:id", deleteSong);
router.put("/reorder/songs", reorderSongs);

export default router;