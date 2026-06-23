# Telibot — Hateful Meme Moderation Bot 🤖🛡️

**Telibot** is a lightweight Telegram group moderation bot that detects and removes hateful or offensive memes using a combined image+text model (ResNet-18 for images + DistilBERT for captions). It has a fast-slur check for quick filtering and an ML model for nuanced cases.

---

## 🚀 Features

- Real-time moderation for group / supergroup chats
- Fast text-scan for banned slurs (immediate block)
- AI-based multimodal classifier (image + caption) using a saved model (`best_model.pt`)
- Temporary image download and cleanup (`temp_images/`)

---

## 🔧 Requirements

- Python 3.8+ (3.10+ recommended)
- GPU optional (PyTorch will use CUDA if available)
- Install dependencies:

```bash
pip install -r requirements.txt
```

(If you add PyTorch to `requirements.txt` separately, install an appropriate CUDA-enabled wheel if you want GPU support.)

---

## ⚙️ Setup

1. Copy or create a `.env` file in the project root with your Telegram bot token:

```env
BOT_TOKEN=your_telegram_bot_token_here
```

2. Ensure `best_model.pt` (the trained PyTorch model) is placed in the project root. If the model is missing or fails to load, the bot will default to safe (non-blocking) behavior and print an AI warning.

3. Ensure the bot has *Delete messages* permission in any group where it will moderate.

---

## ▶️ Usage

Run the bot:

```bash
python main.py
```

- The bot uses polling (`Application.run_polling`) by default. If you previously used webhooks, the code attempts to delete the webhook at startup to avoid conflicts.
- The bot only processes images posted in groups/supergroups (privacy-friendly behavior).

---

## 🧠 Model details

- Model architecture is defined in `ai_judge.py` as a fusion of ResNet-18 (image encoder) and DistilBERT (text encoder). The classifier outputs class logits and the code computes a combined "hate score" from the Hateful/Offensive channels.
- Threshold for blocking is set in `ai_judge.py` (hate_score > 0.170).
- If loading `best_model.pt` fails, the bot logs a warning and returns safe predictions.

---

## ⚠️ Notes & Safety

- This is a moderation aid — not perfect. Review false positives/negatives and tune thresholds or retrain with more data as needed.
- The `check_caption` function uses a small slur list; extend it to match your moderation policy.
- Be mindful of legal or policy obligations when moderating.

---

## 🧪 Development & Testing

- Temporary images are stored in `temp_images/` and deleted after processing. Keep an eye on disk usage if you modify the flow.
- To debug model loading, run `ai_judge.py` directly and inspect the console messages.


