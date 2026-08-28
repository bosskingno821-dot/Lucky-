// transcribe.js
// Ye file audio ko FREE open-source Whisper model se transcribe karti hai
// (Xenova/transformers library - bina kisi paid API ke, seedha server pe chalta hai)

import { pipeline } from "@xenova/transformers";

let transcriberPromise = null;

// Model ek baar load hota hai aur reuse hota hai (fast rehta hai baad ke calls ke liye)
function getTranscriber() {
  if (!transcriberPromise) {
    // "tiny" model use kar rahe hain kyunki free server pe kam RAM/CPU hoti hai
    // Accuracy thodi kam ho sakti hai bade "large" models ke comparison mein, but bilkul free hai
    transcriberPromise = pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-tiny"
    );
  }
  return transcriberPromise;
}

/**
 * Audio file ko transcribe karta hai (FREE open-source Whisper)
 * @param {string} audioFilePath - local path jahan audio file save hai
 * @returns {Array} timestamped segments: [{start, end, text}]
 */
export async function transcribeAudio(audioFilePath) {
  const transcriber = await getTranscriber();

  const output = await transcriber(audioFilePath, {
    chunk_length_s: 30, // 30-second chunks mein process karta hai
    stride_length_s: 5,
    return_timestamps: "chunk", // har chunk ka start/end time deta hai
  });

  // output.chunks mein timestamped text milta hai
  return output.chunks.map((chunk) => ({
    start: chunk.timestamp[0],
    end: chunk.timestamp[1] ?? chunk.timestamp[0] + 5,
    text: chunk.text,
  }));
}
