from flask import Flask, jsonify, request
from flask_cors import CORS
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from pycoingecko import CoinGeckoAPI
from crypto_config import SUPPORTED_TOKENS
from tensorflow.keras.losses import MeanSquaredError
import os

app = Flask(__name__)
CORS(app)
cg = CoinGeckoAPI()

def load_token_model(token_id):
    model_path = f"models/{token_id}/model.h5"
    scaler_path = f"models/{token_id}/scaler.pkl"

    print(f"Looking for model at: {model_path}")
    print(f"Looking for scaler at: {scaler_path}")

    if not os.path.exists(model_path):
        print(f"❌ Model file not found at: {model_path}")
        return None, None
    else:
        print(f"✅ Model found at: {model_path}")

    if not os.path.exists(scaler_path):
        print(f"❌ Scaler file not found at: {scaler_path}")
        return None, None
    else:
        print(f"✅ Scaler found at: {scaler_path}")

    try:
        model = load_model(model_path, custom_objects={"mse": MeanSquaredError()})
        scaler = joblib.load(scaler_path)
        print("✅ Model and scaler successfully loaded.")
        return model, scaler
    except Exception as e:
        print(f"❌ Error loading model or scaler: {e}")
        return None, None


@app.route('/predict', methods=['GET'])
def predict():
    token = request.args.get('token', 'bitcoin').lower()
    
    # Validate token
    if token not in SUPPORTED_TOKENS:
        return jsonify({"error": f"Unsupported token. Try: {list(SUPPORTED_TOKENS.keys())}"}), 400
    
    # Load model
    model, scaler = load_token_model(SUPPORTED_TOKENS[token]["id"])
    if not model:
        return jsonify({"error": "Model not trained for this token"}), 503
    
    # Fetch live data
    data = cg.get_coin_market_chart_by_id(
        id=SUPPORTED_TOKENS[token]["id"],
        vs_currency='usd',
        days=30
    )
    prices = np.array([x[1] for x in data['prices']])
    
    # Predict
    scaled_prices = scaler.transform(prices.reshape(-1, 1))
    sequence = scaled_prices[-30:].reshape(1, 30, 1)
    prediction = model.predict(sequence)[0]
    prediction = scaler.inverse_transform(prediction.reshape(-1, 1)).flatten()
    
    return jsonify({
        "token": token,
        "next_5_days": [round(float(x), 2) for x in prediction]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)