import { execFile } from "child_process";
import path from "path";

export function downloadFromYoutube(url, outputDir) {
  const outputPath = path.join(outputDir, "source.mp4");

  return new Promise((resolve, reject) => {
    execFile(
      "yt-dlp",
      [
        "-f", "mp4",
        "--no-playlist",
        "--extractor-args", "youtube:player_client=ios",
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
