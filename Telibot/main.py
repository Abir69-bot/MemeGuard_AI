import logging
import os
import asyncio
import telegram
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, MessageHandler, filters
from dotenv import load_dotenv

# Import our AI logic
from ai_judge import is_meme_hateful, check_caption

load_dotenv()  # Reads .env file

BOT_TOKEN = os.getenv("BOT_TOKEN")

if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN not found! Create a .env file with BOT_TOKEN=your_token_here")

# Enable logging
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

TEMP_DIR = "temp_images"
os.makedirs(TEMP_DIR, exist_ok=True)

async def image_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Only monitor groups/supergroups (privacy friendly)
    if update.effective_chat.type not in ["group", "supergroup"]:
        return

    msg = update.message
    if not msg or not msg.photo:
        return

    caption = (msg.caption or "").lower()

    # 1. Fast block for text slurs (No AI needed)
    if check_caption(caption):
        await delete_and_warn(context, msg)
        return

    # 2. Download highest quality photo
    file = await msg.photo[-1].get_file()
    path = os.path.join(TEMP_DIR, f"{file.file_id}.jpg")

    try:
        await file.download_to_drive(path)

        # 3. Run AI Model (ResNet-18 + DistilBERT)
        # We run this in a separate thread so it doesn't freeze the bot
        is_hateful = await asyncio.to_thread(is_meme_hateful, path, caption)

        logging.info(f"Processed image {path} (caption='{caption}') => is_hateful={is_hateful}")

        if is_hateful:
            await delete_and_warn(context, msg)

    except Exception as e:
        logging.error(f"Error processing image: {e}")
    finally:
        # Cleanup temp file
        if os.path.exists(path):
            try:
                os.remove(path)
            except:
                pass

async def delete_and_warn(context: ContextTypes.DEFAULT_TYPE, message):
    try:
        # Use explicit chat id and message id attributes
        chat_id = message.chat.id
        msg_id = message.message_id

        await context.bot.delete_message(chat_id=chat_id, message_id=msg_id)

        username = (message.from_user.username or message.from_user.full_name or "User")

        # Send a warning message
        sent_msg = await context.bot.send_message(
            chat_id=chat_id,
            text=f"⚠️ Deleted hateful/offensive meme from @{username}."
        )
        
        # Optional: Auto-delete the warning after 10 seconds to keep chat clean
        # await asyncio.sleep(10)
        # await context.bot.delete_message(message.chat_id, sent_msg.message_id)
        
        logging.info(f"ACTION: Deleted meme from @{username} in chat {chat_id}")
        
    except Exception as e:
        logging.error(
            f"FAILED to delete message: {e} (Ensure Bot is Admin with 'Delete Messages' permission)"
        )

def main():
    # Ensure an event loop is available for the telegram Application
    # Create and set a new event loop to avoid "no current event loop"
    # and to prevent nested-event-loop errors when Application manages
    # the loop and shuts it down itself.
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    app = ApplicationBuilder().token(BOT_TOKEN).build()

    # Filter for Photos only, ignore commands
    app.add_handler(MessageHandler(filters.PHOTO & ~filters.COMMAND, image_handler))

    print("------------------------------------------------------")
    print("HATEFUL MEME BOT IS ONLINE AND PROTECTING GROUPS!")
    print(" Architecture: ResNet-18 (Image) + DistilBERT (Text)")
    print("------------------------------------------------------")

    # Ensure no webhook is set (webhook vs getUpdates conflict)
    try:
        loop.run_until_complete(app.bot.delete_webhook(drop_pending_updates=True))
        logging.info("Deleted webhook (if any) before starting polling")
    except Exception as e:
        logging.warning(f"Could not delete webhook: {e}")

    # run_polling is a blocking call which will use the loop we just set
    # If there is a Conflict (another getUpdates runner), try deleting webhook and retry once.
    try:
        app.run_polling(drop_pending_updates=True)
    except telegram.error.Conflict as e:
        logging.warning(f"Conflict detected when starting polling: {e}. Deleting webhook and retrying once.")
        try:
            loop.run_until_complete(app.bot.delete_webhook(drop_pending_updates=True))
        except Exception as e2:
            logging.error(f"Retry: could not delete webhook: {e2}")
        # Retry once
        app.run_polling(drop_pending_updates=True)

if __name__ == "__main__":
    main()