import sys
import json
from torchvision import models, transforms
from torchvision.models import ResNet18_Weights
from PIL import Image
import torch

def predict(image_path):
    # Load a pretrained model (ResNet18 in this example)
    model = models.resnet18(weights=ResNet18_Weights.IMAGENET1K_V1)
    model.eval()

    # Define the image transformations
    preprocess = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    # Load and preprocess the image
    input_image = Image.open(image_path)
    input_tensor = preprocess(input_image)
    input_batch = input_tensor.unsqueeze(0)

    # Move the input and model to GPU for speed if available
    if torch.cuda.is_available():
        input_batch = input_batch.to('cuda')
        model.to('cuda')

    # Predict the class of the image
    with torch.no_grad():
        output = model(input_batch)
    
    # Get the predicted class
    _, predicted_class = torch.max(output, 1)
    
    # Load ImageNet class labels
    with open("imagenet-simple-labels.json") as f:
        labels = json.load(f)
    
    # Get the predicted class label
    predicted_label = labels[predicted_class.item()]
    
    return predicted_label

if __name__ == "__main__":
    image_path = sys.argv[1]
    prediction = predict(image_path)
    print(prediction)
