from flask import Flask, request, jsonify
from BackendLogicTL import load_model, preprocess_image, predict 
import os
from flask_cors import CORS
import traceback

app = Flask(__name__)
CORS(app)  # Allow all origins

# Load model and class labels at the start of the app
print("[DEBUG] Loading model and class labels")
try:
    model, class_labels = load_model(r'C:\Users\user\OneDrive\Desktop\Artificial Intelligence\working_model\model_with_classes_TransferLearning.pt')
    print("[DEBUG] Model and class labels loaded successfully")
except Exception as e:
    print(f"[ERROR] Failed to load model: {e}")
    traceback.print_exc()
    raise

@app.route('/classify', methods=['POST'])
def classify_image():
    print("[DEBUG] /classify endpoint was called")
    
    # Check if file is in the request
    if 'file' not in request.files:
        print("[ERROR] No file key in request.files")
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    print(f"[DEBUG] Received file: {file.filename}")
    if file.filename == '':
        print("[ERROR] No file selected")
        return jsonify({'error': 'No file selected'}), 400

    # Create temp directory if it does not exist
    if not os.path.exists('temp'):
        os.makedirs('temp')
        print("[DEBUG] Created temp directory")

    temp_path = os.path.join('temp', 'uploaded_image.jpg')
    try:
        file.save(temp_path)
        print(f"[DEBUG] Image saved to: {temp_path}")

        # Preprocess the image
        print("[DEBUG] Preprocessing image")
        input_tensor = preprocess_image(temp_path)
        print(f"[DEBUG] Preprocessed input tensor shape: {input_tensor.shape}")

        # Predict the class
        print("[DEBUG] Starting prediction")
        predicted_class, confidence = predict(model, input_tensor, class_labels)
        print(f"[DEBUG] Predicted class: {predicted_class}, Confidence: {confidence}")

    except Exception as e:
        print(f"[ERROR] An error occurred: {e}")
        traceback.print_exc()
        return jsonify({'error': 'Internal Server Error'}), 500
    finally:
    # Clean up the temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            print("[DEBUG] Temporary file removed")
        if os.path.exists('temp') and not os.listdir('temp'):  # Clean the 'temp' folder if empty
            os.rmdir('temp')
            print("[DEBUG] Temporary directory removed")


    # Return the response
    response = {'class': predicted_class, 'confidence': round(confidence, 2)}
    print(f"[DEBUG] Response: {response}")
    return jsonify(response)

if __name__ == '__main__':
    print("[DEBUG] Flask server is starting...")
    app.run(debug=True)
