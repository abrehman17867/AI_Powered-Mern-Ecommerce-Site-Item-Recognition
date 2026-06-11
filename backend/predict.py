import os
import sys
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LABELS_PATH = os.path.join(SCRIPT_DIR, "imagenet-simple-labels.json")


def predict(image_path):
    from torchvision import models, transforms
    from torchvision.models import ResNet18_Weights
    from PIL import Image
    import torch

    if not os.path.isfile(image_path):
        raise FileNotFoundError(f"Image not found: {image_path}")

    model = models.resnet18(weights=ResNet18_Weights.IMAGENET1K_V1)
    model.eval()

    preprocess = transforms.Compose(
        [
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]
            ),
        ]
    )

    input_image = Image.open(image_path).convert("RGB")
    input_tensor = preprocess(input_image)
    input_batch = input_tensor.unsqueeze(0)

    if torch.cuda.is_available():
        input_batch = input_batch.to("cuda")
        model.to("cuda")

    with torch.no_grad():
        output = model(input_batch)

    _, predicted_class = torch.max(output, 1)

    with open(LABELS_PATH, encoding="utf-8") as f:
        labels = json.load(f)

    return labels[predicted_class.item()]


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python predict.py <image_path>", file=sys.stderr)
        sys.exit(1)
    try:
        print(predict(sys.argv[1]))
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)
