import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential, save_model
from tensorflow.keras.layers import LSTM, Dense
import joblib
from pycoingecko import CoinGeckoAPI
from crypto_config import SUPPORTED_TOKENS, MODEL_PARAMS

cg = CoinGeckoAPI()

def train_token_model(token_id):
    # Fetch token data
    data = cg.get_coin_market_chart_by_id(
        id=token_id, 
        vs_currency='usd', 
        days=MODEL_PARAMS["lookback_days"] + 90
    )
    prices = pd.DataFrame(data['prices'], columns=['timestamp', 'price'])
    
    # Preprocessing
    scaler = MinMaxScaler()
    prices['price_scaled'] = scaler.fit_transform(prices[['price']])
    
    # Create sequences
    X, y = [], []
    lookback = MODEL_PARAMS["lookback_days"]
    for i in range(lookback, len(prices)-MODEL_PARAMS["prediction_days"]):
        X.append(prices['price_scaled'].values[i-lookback:i])
        y.append(prices['price_scaled'].values[i:i+MODEL_PARAMS["prediction_days"]])
    
    X = np.array(X).reshape(-1, lookback, 1)
    y = np.array(y)
    
    # Build model
    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=(lookback, 1)),
        LSTM(64),
        Dense(MODEL_PARAMS["prediction_days"])
    ])
    model.compile(optimizer='adam', loss='mse')
    model.fit(X, y, epochs=MODEL_PARAMS["epochs"], batch_size=32)
    
    # Save model
    os.makedirs(f"models/{token_id}", exist_ok=True)
    save_model(model, f"models/{token_id}/model.h5")
    joblib.dump(scaler, f"models/{token_id}/scaler.pkl")

def train_all_models():
    for token in SUPPORTED_TOKENS.values():
        print(f"Training {token['id']}...")
        train_token_model(token['id'])

if __name__ == '__main__':
    train_all_models()