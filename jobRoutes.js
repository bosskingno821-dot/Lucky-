// jobRoutes.js
// Ye file poora pipeline chalati hai: download -> audio nikalna -> transcribe -> highlights dhundna -> clips banana -> upload
// Website (frontend) yahi routes ko call karegi

import express from "express";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import { downloadVideo } from "./downloadVideo.js";
import { extractAudio, cutAndFormatClip } from "./videoProcessing.js";
import { transcribeAudio } from "./transcribe.js";
import { findHighlights } from "./findHighlights.js";
import { uploadClip } from "./uploadToCloud.js";

const router = express.Router();

// Job ka status yaad rakhne ke liye simple memory storage
// (Production mein ye database mein rakhte hain, abhi ke liye simple)
const jobs = {};

/**
 * POST /api/jobs/start
 * Body: { youtubeUrl: "https://youtube.com/..." }
 * Naya processing job shuru karta hai
 */
router.post("/start", async (req, res) => {
  const { youtubeUrl } = req.body;
  if (!youtubeUrl) {
    return res.status(400).json({ error: "youtubeUrl zaroori hai" });
  }

  const jobId = uuidv4();
  jobs[jobId] = { status: "processing", step: "downloading", clips: [] };

  // Response turant bhej do, processing background mein chalti rahegi
  res.json({ jobId, status: "processing" });

  // Background mein poora pipeline chalao
  processVideo(jobId, youtubeUrl).catch((err) => {
    console.error("Job failed:", err);
    jobs[jobId].status = "failed";
    jobs[jobId].error = err.message;
  });
});

/**
 * GET /api/jobs/:jobId/status
 * Job ka current status check karta hai (frontend isko baar-baar poll karega)
 */
router.get("/:jobId/status", (req, res) => {
  const job = jobs[req.params.jobId];
  if (!job) return res.status(404).json({ error: "Job nahi mila" });
  res.json(job);
});

/**
 * Poora processing pipeline - step by step
 */
async function processVideo(jobId, youtubeUrl) {
  const workDir = path.join("temp", jobId);
  fs.mkdirSync(workDir, { recursive: true });

  // Step 1: Video download karo
  jobs[jobId].step = "downloading";
  const videoPath = await downloadVideo(youtubeUrl, workDir);

  // Step 2: Audio nikalo
  jobs[jobId].step = "extracting_audio";
  const audioPath = await extractAudio(videoPath, workDir);

  // Step 3: Transcribe karo (Whisper)
  jobs[jobId].step = "transcribing";
  const segments = await transcribeAudio(audioPath);

  // Step 4: Highlights dhundo (Claude)
  jobs[jobId].step = "finding_highlights";
  const highlights = await findHighlights(segments);

  // Step 5: Har highlight ka clip cut karo aur upload karo
  jobs[jobId].step = "cutting_clips";
  const finalClips = [];

  for (let i = 0; i < highlights.length; i++) {
    const h = highlights[i];
    const clipPath = path.join(workDir, `clip_${i}.mp4`);
    await cutAndFormatClip(videoPath, h.start, h.end, clipPath);
    const url = await uploadClip(clipPath);
    finalClips.push({ title: h.title, reason: h.reason, url });
  }

  // Step 6: Done!
  jobs[jobId].status = "completed";
  jobs[jobId].step = "done";
  jobs[jobId].clips = finalClips;

  // Temporary files clean up kar do (space bachane ke liye)
  fs.rmSync(workDir, { recursive: true, force: true });
}

export default router;
