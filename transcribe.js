// transcribe.js
// Ye file audio ko FREE open-source Whisper model se transcribe karti hai

import { pipeline } from "@xenova/transformers";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";

let transcriberPromise = null;

function getTranscriber() {
  if (!transcriberPromise) {
    transcriberPromise = pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-tiny"
    );
  }
  return transcriberPromise;
}

// Audio ko 16kHz raw PCM mein convert karta hai (Whisper ko yehi chahiye)
function convertToRawAudio(audioFilePath, outputDir) {
  const rawPath = path.join(outputDir, "audio_raw.wav");
  return new Promise((resolve, reject) => {
    ffmpeg(audioFilePath)
      .audioChannels(1)
      .audioFrequency(16000)
      .format("wav")
      .output(rawPath)
      .on("end", () => resolve(rawPath))
      .on("error", reject)
      .run();
  });
}

// WAV file ko Float32Array mein padhta hai (Whisper ke liye zaroori format)
function readWavAsFloat32(wavPath) {
  const buffer = fs.readFileSync(wavPath);
  // WAV header 44 bytes ka hota hai, usko skip karke raw audio data nikaalte hain
  const dataStart = 44;
  const samples = (buffer.length - dataStart) / 2;
  const float32Array = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    const int16 = buffer.readInt16LE(dataStart + i * 2);
    float32Array[i] = int16 / 32768;
  }
  return float32Array;
}

export async function transcribeAudio(audioFilePath) {
  const outputDir = path.dirname(audioFilePath);
  const rawPath = await convertToRawAudio(audioFilePath, outputDir);
  const audioData = readWavAsFloat32(rawPath);

  const transcriber = await getTranscriber();

  const output = await transcriber(audioData, {
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: "chunk",
  });

  return output.chunks.map((chunk) => ({
    start: chunk.timestamp[0],
    end: chunk.timestamp[1] ?? chunk.timestamp[0] + 5,
    text: chunk.text,
  }));
}
