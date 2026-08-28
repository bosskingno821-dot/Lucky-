# ClipCraft Backend — 100% FREE Setup Guide (Hinglish)

Ye backend tumhare ClipCraft website ka "engine" hai — poora **bilkul free** stack:
- Video download → yt-dlp (free)
- Transcription → Open-source Whisper (free, server pe hi chalta hai)
- Highlight detection → Google Gemini free tier (roz 1500 requests free)
- Clips cutting → FFmpeg (free)
- Storage → Cloudinary free tier (25GB free)
- Hosting → Railway free tier

Koi bhi paid API key nahi chahiye is setup mein!

---

## Step 1: Gemini API Key (already le chuke ho ✅)

Agar nahi li: aistudio.google.com → "Get API Key" → "Create API Key"

## Step 2: Cloudinary Account Banao (Clips store karne ke liye)

1. Jao: cloudinary.com → Free sign up karo
2. Dashboard mein teen cheezein milengi:
   - Cloud Name
   - API Key
   - API Secret
3. In teeno ko copy karke rakh lo

---

## Step 3: GitHub Pe Code Upload Karo

1. github.com pe login karo
2. "New Repository" → naam do `clipcraft-backend`
3. Is poore `clipcraft-backend` folder ka code us repository mein upload karo
   (GitHub website pe "Upload files" option hota hai — drag & drop kar sakte ho)

---

## Step 4: Railway Pe Deploy Karo

1. railway.app pe login karo (GitHub se)
2. "New Project" → "Deploy from GitHub repo" → apna `clipcraft-backend` repo select karo
3. Deploy hote hi "Variables" tab mein ye keys daalo:
   - GEMINI_API_KEY
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
4. Deploy hone ke baad Railway ek URL dega — ye tumhara "backend URL" hai

---

## Step 5: Test Karo

Browser mein apna Railway URL kholo — agar ye dikhe:
```json
{"status": "ClipCraft backend chal raha hai ✅"}
```
...to sab sahi hai! 🎉

---

## Zaroori Baatein (Free Stack Ke Baare Mein)

- **Pehli baar chhota video test karo** (2-3 min) — open-source Whisper Railway ke
  free/limited CPU pe thoda slow chal sakta hai bade videos ke liye
- **Gemini free tier** mein roz ki limit hai — agar bahut zyada log use karenge to
  limit khatam ho sakti hai (tab thoda wait karna padega agle din tak)
- **Railway free tier** mein $5 credit milta hai mahine ka — halka traffic ke liye kaafi hai
- Agar koi step error de, error message copy karke Claude ko bhejna — turant fix ho jayega

---

## Aage Kya (Jab Traffic Badhega)

Jab zyada log use karne lagenge aur free limits kam padne lagengi, tab paid upgrade
ka option hoga (Gemini paid tier, ya bada Whisper model). Abhi ke liye shuruaat aur
testing ke liye ye poora free setup kaafi hai.
