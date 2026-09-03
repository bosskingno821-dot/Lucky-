// jobRoutes.js
// Ye file poora pipeline chalati hai: download/upload -> audio nikalna -> transcribe -> highlights dhundna -> clips banana -> upload

import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import { v4 as uuidv4 } from "uuid";

import { downloadVideo } from "./downloadVideo.js";
import { extractAudio, cutAndFormatClip } from "./videoProcessing.js";
import { transcribeAudio } from "./transcribe.js";
import { findHighlights } from "./findHighlights.js";
import { uploadClip } from "./uploadToCloud.js";

const router = express.Router();

const jobs = {};

const MAX_DURATION_SECONDS = 6 * 60;

const uploadDir = "temp/_uploads";
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 200 * 1024 * 1024 },
});

router.post("/start", async (req, res) => {
  const { youtubeUrl } = req.body;
  if (!youtubeUrl) {
    return res.status(400).json({ error: "youtubeUrl zaroori hai" });
  }

  const jobId = uuidv4();
  jobs[jobId] = { status: "processing", step: "downloading", clips: [] };
  res.json({ jobId, status: "processing" });

  const workDir = path.join("temp", jobId);
  fs.mkdirSync(workDir, { recursive: true });

  (async () => {
    try {
      const videoPath = await downloadVideo(youtubeUrl, workDir);
      await runPipeline(jobId, videoPath, workDir);
    } catch (err) {
      console.error("Job failed:", err);
      jobs[jobId].status = "failed";
      jobs[jobId].error = err.message;
      fs.rmSync(workDir, { recursive: true, force: true });
    }
  })();
});

router.post("/upload", upload.single("video"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Video file zaroori hai" });
  }

  const jobId = uuidv4();
  const workDir = path.join("temp", jobId);
  fs.mkdirSync(workDir, { recursive: true });

  const ext = path.extname(req.file.originalname || "") || ".mp4";
  const videoPath = path.join(workDir, `source${ext}`);
  fs.renameSync(req.file.path, videoPath);

  jobs[jobId] = { status: "processing", step: "extracting_audio", clips: [] };
  res.json({ jobId, status: "processing" });

  runPipeline(jobId, videoPath, workDir).catch((err) => {
    console.error("Job failed:", err);
    jobs[jobId].status = "failed";
    jobs[jobId].error = err.message;
    fs.rmSync(workDir, { recursive: true, force: true });
  });
});

router.get("/:jobId/status", (req, res) => {
  const job = jobs[req.params.jobId];
  if (!job) return res.status(404).json({ error: "Job nahi mila" });
  res.json(job);
});

function getDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration);
    });
  });
}

async function runPipeline(jobId, videoPath, workDir) {
  try {
    const duration = await getDuration(videoPath);
    if (duration > MAX_DURATION_SECONDS) {
      throw new Error(
        `Video bahut lamba hai (${Math.round(duration / 60)} minute). Free plan pe abhi sirf ${MAX_DURATION_SECONDS / 60} minute tak ke video support hain, taaki server crash na ho.`
      );
    }

    jobs[jobId].step = "extracting_audio";
    const audioPath = await extractAudio(videoPath, workDir);

    jobs[jobId].step = "transcribing";
    const segments = await transcribeAudio(audioPath);

    jobs[jobId].step = "finding_highlights";
    const highlights = await findHighlights(segments);

    jobs[jobId].step = "cutting_clips";
    const finalClips = [];

    for (let i = 0; i < highlights.length; i++) {
      const h = highlights[i];
      const clipPath = path.join(workDir, `clip_${i}.mp4`);
      await cutAndFormatClip(videoPath, h.start, h.end, clipPath);
      const url = await uploadClip(clipPath);
      finalClips.push({ title: h.title, reason: h.reason, url });
    }

    jobs[jobId].status = "completed";
    jobs[jobId].step = "done";
    jobs[jobId].clips = finalClips;
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

export default router;
