// videoProcessing.js
// Ye file FFmpeg ka use karke: 1) audio nikalti hai, 2) video ke clips cut karti hai (vertical format mein)

import ffmpeg from "fluent-ffmpeg";
import path from "path";

/**
 * Video se audio nikalta hai (Whisper ko bhejne ke liye)
 */
export function extractAudio(videoPath, outputDir) {
  const audioPath = path.join(outputDir, "audio.mp3");
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(audioPath)
      .noVideo()
      .audioCodec("libmp3lame")
      .on("end", () => resolve(audioPath))
      .on("error", reject)
      .run();
  });
}

/**
 * Video ka ek chhota clip cut karta hai aur vertical (9:16) format mein resize karta hai
 * @param {string} videoPath - original video ka path
 * @param {number} start - clip kahan se start hoga (seconds)
 * @param {number} end - clip kahan khatam hoga (seconds)
 * @param {string} outputPath - clip kahan save hogi
 */
export function cutAndFormatClip(videoPath, start, end, outputPath) {
  const duration = end - start;
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .setStartTime(start)
      .setDuration(duration)
      // Video ko crop karke 9:16 (vertical) format mein laate hain
      .videoFilters([
        "crop=ih*9/16:ih",
        "scale=1080:1920",
      ])
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .run();
  });
}
