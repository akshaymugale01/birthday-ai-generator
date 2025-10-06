import express from "express";
import { updateUserDetails, generateLyrics, generateAudio } from "../controller/songController.js";

const router = express.Router();

router.post("/update-details", updateUserDetails);
router.post("/generate-lyrics", generateLyrics);
router.post("/generate-audio", generateAudio);

export default router;