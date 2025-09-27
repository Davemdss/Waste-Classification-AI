import torch
import cv2
import numpy as np
from Model_Code_TL_ver import ResNetTransferLearning # Adjust if needed for the correct model class

# Load the model and class labels
def load_model(model_path):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Load the checkpoint
    checkpoint = torch.load(model_path, map_location=device)

    # Initialize the model using ResNetTransferLearning
    model = ResNetTransferLearning(num_classes=len(checkpoint['classes']))  # Dynamically set the number of output classes
    model.load_state_dict(checkpoint['state_dict'])
    model.to(device)
    model.eval()

    # Retrieve class labels from the checkpoint
    class_labels = checkpoint['classes']

    return model, class_labels


# Preprocess the image
def preprocess_image(image_path):
    image = cv2.imread(image_path)
    image = cv2.resize(image, (224, 224))  # Match resize from training
    image = np.transpose(image, (2, 0, 1))  # HWC to CHW
    image = torch.tensor(image).unsqueeze(0).float() / 255.0  # Normalize to [0, 1]
    image = image.sub_(torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1)).div_(torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1))  # Normalize like training
    return image

# Predict function
def predict(model, input_tensor, class_labels):
    device = next(model.parameters()).device  # Get the model's device (CPU or GPU)
    input_tensor = input_tensor.to(device)  # Move input tensor to the same device as the model

    with torch.no_grad():
        outputs = model(input_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)  # Apply softmax to get probabilities
        predicted_class = torch.argmax(probabilities, dim=1).item()  # Get the predicted class index
        confidence = torch.max(probabilities, dim=1).values.item()  # Get the confidence level

        # Map the predicted class index to its name
        class_name = class_labels[predicted_class] if 0 <= predicted_class < len(class_labels) else "Unknown Class"

    return class_name, confidence


