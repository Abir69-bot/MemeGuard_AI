import os
import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms, models # type: ignore
from transformers import AutoTokenizer, AutoModel
from dotenv import load_dotenv

load_dotenv()

MODEL_PATH = "best_model.pt"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print("Loading your real hateful meme model...")

# === EXACT ARCHITECTURE FROM YOUR "DEBUG_MODEL" OUTPUT ===
class HatefulMemeModel(nn.Module):
    def __init__(self, num_classes=3):
        super().__init__()
        
        # 1. Image Encoder: ResNet-18
        # The saved weights use: img_encoder.conv1, img_encoder.bn1, img_encoder.layer1/2/3/4
        # So we define img_encoder as a container with those exact attributes
        resnet = models.resnet18(weights=None)
        
        class ResNetEncoder(nn.Module):
            def __init__(self, resnet):
                super().__init__()
                self.conv1 = resnet.conv1
                self.bn1 = resnet.bn1
                self.relu = resnet.relu
                self.maxpool = resnet.maxpool
                self.layer1 = resnet.layer1
                self.layer2 = resnet.layer2
                self.layer3 = resnet.layer3
                self.layer4 = resnet.layer4
                self.avgpool = resnet.avgpool
                
            def forward(self, x):
                x = self.conv1(x)
                x = self.bn1(x)
                x = self.relu(x)
                x = self.maxpool(x)
                x = self.layer1(x)
                x = self.layer2(x)
                x = self.layer3(x)
                x = self.layer4(x)
                x = self.avgpool(x)
                return x
        
        self.img_encoder = ResNetEncoder(resnet) 
        
        # 2. Text Encoder: DistilBERT
        # Output: 768 features (Vocab 30522)
        self.txt_encoder = AutoModel.from_pretrained("distilbert-base-uncased")
        
        # 3. Classifier (Based on your debug output: 1280 -> 256 -> 3)
        # Input = 512 (Img) + 768 (Txt) = 1280
        self.classifier = nn.Sequential(
            nn.Linear(1280, 256),    # classifier.0
            nn.ReLU(),               # classifier.1
            nn.Dropout(0.5),         # classifier.2
            nn.Linear(256, num_classes) # classifier.3
        )

    def forward(self, images, input_ids, attention_mask):
        # --- Image Path ---
        img_feat = self.img_encoder(images) 
        img_feat = img_feat.view(img_feat.size(0), -1) # Flatten -> [B, 512]

        # --- Text Path ---
        txt_out = self.txt_encoder(input_ids=input_ids, attention_mask=attention_mask)
        txt_feat = txt_out.last_hidden_state[:, 0, :] # [CLS] -> [B, 768]

        # --- Fusion ---
        combined = torch.cat((img_feat, txt_feat), dim=1) # -> [B, 1280]

        # --- Classification ---
        return self.classifier(combined)

# Initialize Model
model = HatefulMemeModel().to(DEVICE)

    # Load Weights with fallback mode if mismatch
model_loaded_successfully = False
if os.path.exists(MODEL_PATH):
    print(f"Loading weights from {MODEL_PATH}...")
    state_dict = torch.load(MODEL_PATH, map_location=DEVICE)

    # Fix "module." prefix if present
    if list(state_dict.keys())[0].startswith("module."):
        state_dict = {k[7:]: v for k, v in state_dict.items()}

    # Try loading with strict=True first
    try:
        model.load_state_dict(state_dict, strict=True) 
        model_loaded_successfully = True
        print(f"MODEL LOADED PERFECTLY ON {DEVICE}!")
    except Exception as e:
        print(f"Key mismatch during strict load, retrying with strict=False...")
        try:
            model.load_state_dict(state_dict, strict=False)
            model_loaded_successfully = True
            print(f"MODEL LOADED WITH PARTIAL WEIGHTS ON {DEVICE}!")
        except Exception as e2:
            print(f"FAILED to load model even with strict=False: {e2}")
            print(f"Bot will use random/initialized weights and return all-safe predictions.")
            model_loaded_successfully = False
else:
    print("ERROR: best_model.pt not found!")
    print("Bot will use random/initialized weights and return all-safe predictions.")

model.eval()

# === CORRECT TOKENIZER (DistilBERT) ===
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")

# === IMAGE TRANSFORMS (ResNet-18 Standard) ===
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

def is_meme_hateful(image_path: str, caption: str = "") -> bool:
    try:
        img = Image.open(image_path).convert("RGB")
        img_tensor = transform(img).unsqueeze(0).to(DEVICE)

        text = caption.strip() if caption.strip() else "meme"
        
        encoded = tokenizer(
            text, 
            padding="max_length", 
            max_length=64, 
            truncation=True, 
            return_tensors="pt"
        )
        input_ids = encoded["input_ids"].to(DEVICE)
        attention_mask = encoded["attention_mask"].to(DEVICE)

        with torch.no_grad():
            logits = model(img_tensor, input_ids, attention_mask)
            prob = torch.softmax(logits, dim=1)[0]

            # 0=Safe, 1=Hateful, 2=Offensive (example mapping)
            hate_score = prob[1].item() + prob[2].item()

            # If model failed to load, warn user and return False (safe)
            if not model_loaded_successfully:
                print(f"[AI WARNING] Model not loaded successfully; returning safe by default")
                hate_score = 0.0

        result = hate_score > 0.170
        print(f"[AI] Hate score: {hate_score:.3f} -> {'BLOCKED' if result else 'safe'}")
        return result

    except Exception as e:
        print(f"Error processing meme: {e}")
        return False

def check_caption(caption: str) -> bool:
    bad = ["nigger", "kike", "faggot", "tranny", "hitler", "gas the", "1488"]
    return any(word in caption.lower() for word in bad)
