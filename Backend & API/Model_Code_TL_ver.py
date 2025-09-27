import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms
from PIL import Image
import matplotlib.pyplot as plt
import random
from collections import Counter
from torchvision import models

class WasteDataset(Dataset):
    def __init__(self, root_dir, split, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.classes = sorted(os.listdir(root_dir))
        self.image_paths = []
        self.labels = []
        
        for i, class_name in enumerate(self.classes):
            class_dir = os.path.join(root_dir, class_name)
            for subfolder in ['default', 'real_world']:
                subfolder_dir = os.path.join(class_dir, subfolder)
                image_names = os.listdir(subfolder_dir)
                random.shuffle(image_names)
                
                if split == 'train':
                    image_names = image_names[:int(0.6 * len(image_names))]
                elif split == 'val':
                    image_names = image_names[int(0.6 * len(image_names)):int(0.8 * len(image_names))]
                else:  # split == 'test'
                    image_names = image_names[int(0.8 * len(image_names)):]
                
                for image_name in image_names:
                    self.image_paths.append(os.path.join(subfolder_dir, image_name))
                    self.labels.append(i)
    
    def __len__(self):
        return len(self.image_paths)
    
    def __getitem__(self, index):
        image_path = self.image_paths[index]
        label = self.labels[index]
        image = Image.open(image_path).convert('RGB')
        
        if self.transform:
            image = self.transform(image)
        
        return image, label



class ResNetTransferLearning(nn.Module):
    def __init__(self, num_classes):
        super().__init__()
        # Load pre-trained ResNet model
        self.resnet = models.resnet50(pretrained=True)
        
        # Freeze the base layers
        for param in self.resnet.parameters():
            param.requires_grad = False
        
        # Replace the final fully connected layer
        num_features = self.resnet.fc.in_features
        self.resnet.fc = nn.Sequential(
            nn.Linear(num_features, 256),  # Add a dense layer
            nn.ReLU(),
            nn.Dropout(0.4),              # Add dropout for regularization
            nn.Linear(256, num_classes)   # Final layer for classification
        )
    
    def forward(self, x):
        return self.resnet(x)


# Encapsulate training and testing logic
def train_and_save_model():
    # Set the dataset path and hyperparameters
    dataset_path = r"C:\Users\user\OneDrive\Desktop\Artificial Intelligence\kaggle\input\recyclable-and-household-waste-classification\images\images\images"
    batch_size = 32
    num_epochs = 10
    learning_rate = 0.0001

    # Create the datasets and data loaders
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    train_dataset = WasteDataset(dataset_path, split='train', transform=transform)
    val_dataset = WasteDataset(dataset_path, split='val', transform=transform)
    test_dataset = WasteDataset(dataset_path, split='test', transform=transform)
    train_dataloader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_dataloader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    test_dataloader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)

   # buat model dan optimisasi
    num_classes = len(os.listdir(dataset_path))  # Assuming each folder is a class
    model = ResNetTransferLearning(num_classes).to('cuda')  # Ensure the model runs on GPU
    criterion = nn.CrossEntropyLoss()
    # Train only the final layers
    optimizer = optim.Adam(model.resnet.fc.parameters(), lr=learning_rate)


    train_losses = []
    val_losses = []

    # Training loop
    for epoch in range(num_epochs):
        # Training
        model.train()
        train_loss = 0.0
        for images, labels in train_dataloader:
            images = images.to('cuda')
            labels = labels.to('cuda')
            
            outputs = model(images)
            loss = criterion(outputs, labels)
            
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item() * images.size(0)
        
        train_loss /= len(train_dataset)
        train_losses.append(train_loss)
        
        
