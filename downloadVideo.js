// downloadVideo.js
// YouTube link ke liye yt-dlp, aur direct video file link ke liye seedha download

import fs from "fs";
import path from "path";
import { execFile } from "child_process";

export async function downloadVideo(url, outputDir) {
  const outputPath = path.join(outputDir, "source.mp4");

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return downloadFromYoutube(url, outputPath);
  }

  // Direct video file link (jaise .mp4 link)
  const res = await fetch(url);
  if (!res.ok) throw new Error(`File download fail hui: ${res.status}`);
  const fileStream = fs.createWriteStream(outputPath);
  await new Promise((resolve, reject) => {
    res.body.pipe(fileStream);
    res.body.on("error", reject);
    fileStream.on("finish", resolve);
  });
  return outputPath;
}

function downloadFromYoutube(url, outputPath) {
  return new Promise((resolve, reject) => {
    execFile(
      "yt-dlp",
      [
        "-f", "mp4",
        "--no-playlist",
        "--extractor-args", "youtube:player_client=android",
        "-o", outputPath,
        url,
      ],
      (error) => {
        if (error) return reject(error);
        resolve(outputPath);
      }
    );
  });
}
