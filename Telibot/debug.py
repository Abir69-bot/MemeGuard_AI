import torch
import os

MODEL_PATH = "best_model.pt"

print(f"--- DIAGNOSING {MODEL_PATH} ---")

if not os.path.exists(MODEL_PATH):
    print(f"❌ CRITICAL ERROR: '{MODEL_PATH}' was not found in this folder.")
    print(f"Current folder: {os.getcwd()}")
    print("Please make sure the file is named exactly 'best_model.pt'.")
    exit()

try:
    # Load the file
    loaded_data = torch.load(MODEL_PATH, map_location="cpu")
    print("✅ File loaded successfully.")

    # 1. Unwrap if it's a checkpoint dictionary (common in PyTorch Lightning/custom loops)
    state_dict = loaded_data
    if isinstance(loaded_data, dict):
        keys = list(loaded_data.keys())
        print(f"ℹ️  Top-level keys found: {keys}")
        
        if "state_dict" in keys:
            print("-> Found 'state_dict' key, extracting weights from inside...")
            state_dict = loaded_data["state_dict"]
        elif "model" in keys:
            print("-> Found 'model' key, extracting weights from inside...")
            state_dict = loaded_data["model"]
    
    # 2. Fix 'module.' prefix if trained on multi-GPU
    new_state_dict = {}
    for k, v in state_dict.items():
        if k.startswith("module."):
            new_state_dict[k[7:]] = v
        else:
            new_state_dict[k] = v
    state_dict = new_state_dict

    # 3. PRINT RELEVANT SHAPES
    print("\n--- DETECTED LAYER SHAPES ---")
    print("(Looking for Linear layers to determine architecture)")
    
    found_classifier = False
    
    for key, value in state_dict.items():
        # We only care about weights, not biases
        if "weight" in key and len(value.shape) >= 2:
            # Check for Classification Head
            if "classifier" in key or "fc" in key or "linear" in key:
                print(f" • {key}  ---> Shape: {list(value.shape)}")
                found_classifier = True
            
            # Check for Text Embeddings (to ID Bert vs RoBERTa)
            if "embeddings.word_embeddings" in key:
                vocab_size = value.shape[0]
                model_type = "Unknown"
                if vocab_size == 30522: model_type = "BERT/DistilBERT"
                if vocab_size == 50265: model_type = "RoBERTa/DistilRoBERTa"
                print(f" • {key}  ---> Vocab: {vocab_size} ({model_type})")

    if not found_classifier:
        print("\n⚠️  No obvious classifier layers found. Dumping first 5 keys:")
        for k in list(state_dict.keys())[:5]:
            print(f"   {k}")

except Exception as e:
    print(f"\n❌ CRASHED WHILE READING FILE: {e}")

print("\n-----------------------------")