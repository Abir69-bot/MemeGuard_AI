import os
import io
import uuid
import json
from PIL import Image
from flask import Flask, render_template, request, redirect, url_for, send_from_directory, jsonify

import torch
import torch.nn.functional as F
import numpy as np

# Import the user's AI logic (must be in the same folder or on PYTHONPATH)
import ai_judge

app = Flask(__name__)

TEMP_DIR = os.path.join(os.path.dirname(__file__), "temp_images")
os.makedirs(TEMP_DIR, exist_ok=True)


def generate_gradcam(image_path: str, target_class: int = 1):
    """Generate a Grad-CAM heatmap for `target_class` using the model in `ai_judge`.
    Returns path to saved overlay image (JPEG).
    """
    device = ai_judge.DEVICE
    model = ai_judge.model
    model.eval()

    # Use same preprocess as ai_judge
    transform = ai_judge.transform

    img_pil = Image.open(image_path).convert("RGB")
    tensor = transform(img_pil).unsqueeze(0).to(device)

    activations = None
    gradients = None

    def forward_hook(module, input, output):
        nonlocal activations
        activations = output

        # register hook to capture gradients on this activation tensor
        def save_grad(grad):
            nonlocal gradients
            gradients = grad

        output.register_hook(save_grad)

    # Attach hook to layer4 of the image encoder
    handle = None
    try:
        # layer4 is a nn.Sequential; hook it to capture output
        handle = ai_judge.model.img_encoder.layer4.register_forward_hook(forward_hook)

        # Forward
        logits = model(tensor, *[None]*0) if False else None
    except Exception:
        # the model forward in ai_judge takes (images, input_ids, attention_mask)
        # We'll call the model and compute grads on the image branch by providing a dummy text input
        # Prepare a dummy text encoding with tokenizer
        tok = ai_judge.tokenizer(
            "meme",
            padding="max_length",
            max_length=64,
            truncation=True,
            return_tensors="pt",
        )
        input_ids = tok["input_ids"].to(device)
        attention_mask = tok["attention_mask"].to(device)

        # Forward pass
        out = model(tensor, input_ids, attention_mask)
        probs = F.softmax(out, dim=1)

        # target logit
        score = out[0, target_class]

        # Backward to get gradients
        model.zero_grad()
        score.backward(retain_graph=True)

        # activations and gradients should be populated by hooks

    finally:
        if handle is not None:
            handle.remove()

    if activations is None or gradients is None:
        return None

    # Convert tensors to CPU numpy
    acts = activations.detach().cpu()[0]  # [C,H,W]
    grads = gradients.detach().cpu()[0]  # [C,H,W]

    # Global-average-pool gradients -> weights
    weights = grads.mean(dim=(1, 2))  # [C]

    # Weighted combination of activations
    cam = (weights[:, None, None] * acts).sum(dim=0)
    cam = np.maximum(cam, 0)

    # Normalize CAM to [0,1]
    cam = cam - cam.min()
    if cam.max() != 0:
        cam = cam / cam.max()

    # Resize cam to original image size
    cam_img = Image.fromarray(np.uint8(cam * 255)).resize(img_pil.size, resample=Image.BILINEAR)
    cam_np = np.array(cam_img)

    # Create heatmap
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.cm as cm

    colormap = cm.get_cmap("jet")
    colored_cam = colormap(cam_np / 255.0)[:, :, :3]
    colored_cam = Image.fromarray((colored_cam * 255).astype(np.uint8))

    # Overlay heatmap on original image
    overlay = Image.blend(img_pil, colored_cam, alpha=0.45)

    out_name = f"gradcam_{uuid.uuid4().hex}.jpg"
    out_path = os.path.join(TEMP_DIR, out_name)
    overlay.save(out_path, quality=90)
    return out_name


def categorize_concern(is_hateful: bool, caption_flag: bool) -> str:
    """Return category of concern based on flags."""
    if caption_flag:
        return "hate speech"
    if is_hateful:
        return "hateful/offensive content"
    return "None"


def generate_reasoning(is_hateful: bool, caption_flag: bool, caption: str) -> str:
    """Generate safe explanation without repeating harmful content."""
    if caption_flag and is_hateful:
        return "The caption contains offensive language and the image is classified as hateful/offensive by the model."
    if caption_flag:
        return "The caption contains flagged offensive language."
    if is_hateful:
        return "The image has been classified as hateful or offensive based on visual and textual analysis."
    return "No hateful or offensive content detected."


@app.route("/temp_images/<path:filename>")
def temp_images(filename):
    return send_from_directory(TEMP_DIR, filename)


@app.route("/api/analyze", methods=["POST"])
def api_analyze():
    """
    API endpoint that accepts image upload and returns structured JSON response.
    Format:
    {
        "is_hateful": true/false,
        "category_of_concern": "...",
        "reasoning": "...",
        "confidence": 0.0-1.0 (optional),
        "caption_provided": true/false,
        "model_status": "success" or "failed"
    }
    """
    try:
        file = request.files.get("image")
        caption = (request.form.get("caption") or "").strip()

        if not file or file.filename == "":
            return jsonify({"error": "No image provided"}), 400

        # Save upload
        uid = uuid.uuid4().hex
        filename = f"api_upload_{uid}.jpg"
        save_path = os.path.join(TEMP_DIR, filename)
        img = Image.open(file.stream).convert("RGB")
        img.save(save_path)

        # Quick caption check
        caption_flag = ai_judge.check_caption(caption)

        # Run model
        is_hateful = False
        model_status = "success"
        try:
            is_hateful = ai_judge.is_meme_hateful(save_path, caption)
        except Exception as e:
            model_status = "failed"
            is_hateful = False

        # Categorize and reason
        category = categorize_concern(is_hateful, caption_flag)
        reasoning = generate_reasoning(is_hateful, caption_flag, caption)

        # Build response
        response = {
            "is_hateful": is_hateful or caption_flag,
            "category_of_concern": category,
            "reasoning": reasoning,
            "caption_provided": bool(caption),
            "model_status": model_status,
        }

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e), "model_status": "error"}), 500


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        file = request.files.get("image")
        caption = (request.form.get("caption") or "").strip()

        if not file:
            return redirect(request.url)

        # Save upload
        uid = uuid.uuid4().hex
        filename = f"upload_{uid}.jpg"
        save_path = os.path.join(TEMP_DIR, filename)
        img = Image.open(file.stream).convert("RGB")
        img.save(save_path)

        # Quick caption check
        caption_flag = ai_judge.check_caption(caption)

        # Run model
        try:
            is_hateful = ai_judge.is_meme_hateful(save_path, caption)
        except Exception as e:
            is_hateful = False

        gradcam_file = None
        if is_hateful:
            try:
                # target_class 1 = Hateful in your mapping
                gradcam_file = generate_gradcam(save_path, target_class=1)
            except Exception:
                gradcam_file = None

        # Prepare explanation
        explanation = []
        if caption_flag:
            explanation.append("Caption contains flagged slur/phrases.")
        if is_hateful:
            explanation.append("Model judged meme as hateful/offensive.")
        else:
            explanation.append("Model judged meme as safe.")

        return render_template(
            "result.html",
            image_url=url_for("temp_images", filename=filename),
            gradcam_url=(url_for("temp_images", filename=gradcam_file) if gradcam_file else None),
            caption=caption,
            is_hateful=is_hateful,
            explanation=explanation,
        )

    return render_template("index.html")


if __name__ == "__main__":
    # Note: for development only. Use a WSGI server for production.
    app.run(host="0.0.0.0", port=5000, debug=True)
