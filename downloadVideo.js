// downloadVideo.js
// Ye file YouTube link se video download karti hai (yt-dlp use karke)

import youtubedl from "youtube-dl-exec";
import path from "path";

/**
 * YouTube URL se video download karta hai
 * @param {string} url - YouTube video link
 * @param {string} outputDir - jahan file save honi hai
 * @returns {string} downloaded file ka path
 */
export async function downloadFromYoutube(url, outputDir) {
  const outputPath = path.join(outputDir, "source.mp4");

  await youtubedl(url, {
    output: outputPath,
    format: "mp4",
    noPlaylist: true,
  });

  return outputPath;
}
