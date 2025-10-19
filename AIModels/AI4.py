import numpy as np
import pandas as pd
import yfinance as yf
from datetime import datetime
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import tensorflow as tf
from tensorflow.keras.models import Sequential, load_model
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint
import json
import os
import warnings
warnings.filterwarnings('ignore')


class CryptoLSTMPredictor:
    """LSTM model for crypto trading predictions"""
    
    def __init__(self, symbol, lookback_days=60, model_path='models/'):
        self.symbol = symbol
        self.lookback_days = lookback_days
        self.model_path = model_path
        self.model = None
        self.feature_scaler = MinMaxScaler(feature_range=(0, 1))
        
        os.makedirs(model_path, exist_ok=True)
        self.buy_threshold = 0.02
        self.sell_threshold = -0.02
    
    def fetch_data(self, period='2y'):
        print(f"📊 Fetching data for {self.symbol}...")
        ticker = yf.Ticker(self.symbol)
        df = ticker.history(period=period, auto_adjust=True)
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
        if df.empty:
            raise ValueError(f"No data returned for {self.symbol}")
        print(f"✅ Fetched {len(df)} days of data")
        return df
    
    def create_features(self, df):
        df = df.copy()
        df['Returns'] = df['Close'].pct_change()
        df['High_Low_Pct'] = (df['High'] - df['Low']) / df['Close']
        df['Close_Open_Pct'] = (df['Close'] - df['Open']) / df['Open']
        
        df['SMA_5'] = df['Close'].rolling(5).mean()
        df['SMA_10'] = df['Close'].rolling(10).mean()
        df['SMA_20'] = df['Close'].rolling(20).mean()
        df['SMA_50'] = df['Close'].rolling(50).mean()
        
        df['EMA_12'] = df['Close'].ewm(span=12, adjust=False).mean()
        df['EMA_26'] = df['Close'].ewm(span=26, adjust=False).mean()
        df['MACD'] = df['EMA_12'] - df['EMA_26']
        df['MACD_Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
        
        delta = df['Close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
        rs = gain / loss
        df['RSI'] = 100 - (100 / (1 + rs))
        
        df['BB_Middle'] = df['Close'].rolling(20).mean()
        bb_std = df['Close'].rolling(20).std()
        df['BB_Upper'] = df['BB_Middle'] + (2 * bb_std)
        df['BB_Lower'] = df['BB_Middle'] - (2 * bb_std)
        df['BB_Width'] = (df['BB_Upper'] - df['BB_Lower']) / df['BB_Middle']
        
        df['Volatility'] = df['Returns'].rolling(20).std()
        df['Volume_MA'] = df['Volume'].rolling(20).mean()
        df['Volume_Ratio'] = df['Volume'] / df['Volume_MA']
        df.dropna(inplace=True)
        return df
    
    def prepare_data(self, df):
        feature_columns = [
            'Close', 'Volume', 'Returns', 'High_Low_Pct', 'Close_Open_Pct',
            'SMA_5', 'SMA_10', 'SMA_20', 'SMA_50',
            'EMA_12', 'EMA_26', 'MACD', 'MACD_Signal',
            'RSI', 'BB_Width', 'Volatility', 'Volume_Ratio'
        ]
        data = df[feature_columns].values
        scaled_data = self.feature_scaler.fit_transform(data)
        
        X, y = [], []
        for i in range(self.lookback_days, len(scaled_data)):
            X.append(scaled_data[i-self.lookback_days:i])
            current_price = df['Close'].iloc[i-1]
            next_price = df['Close'].iloc[i]
            price_change = (next_price - current_price) / current_price
            y.append(price_change)
        return np.array(X), np.array(y), df
    
    def build_model(self, input_shape):
        model = Sequential([
            LSTM(128, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            LSTM(64, return_sequences=True),
            Dropout(0.2),
            LSTM(32, return_sequences=False),
            Dropout(0.2),
            Dense(16, activation='relu'),
            Dense(1)
        ])
        model.compile(optimizer='adam', loss='mse', metrics=['mse'])
        return model
    
    def train(self, epochs=50, batch_size=32, validation_split=0.2):
        df = self.fetch_data()
        df = self.create_features(df)
        X, y, _ = self.prepare_data(df)
        
        print(f"\n📊 Data prepared: {X.shape[0]} samples, {X.shape[1]} timesteps, {X.shape[2]} features")
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
        print(f"🔀 Train samples: {len(X_train)}, Test samples: {len(X_test)}")
        
        self.model = self.build_model(input_shape=(X.shape[1], X.shape[2]))
        self.model.summary()
        
        early_stop = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
        model_checkpoint = ModelCheckpoint(f'{self.model_path}{self.symbol.replace("-", "_")}_best.keras', monitor='val_loss', save_best_only=True)
        
        history = self.model.fit(X_train, y_train, epochs=epochs, batch_size=batch_size,
                                 validation_split=validation_split, callbacks=[early_stop, model_checkpoint], verbose=1)
        
        test_loss, test_mse = self.model.evaluate(X_test, y_test, verbose=0)
        print(f"✅ Test Loss: {test_loss:.6f}, Test MSE: {test_mse:.6f}")
        self.save_model()
        return history
    
    def predict_next_move(self):
        df = self.fetch_data(period='3mo')
        df = self.create_features(df)
        
        feature_columns = [
            'Close', 'Volume', 'Returns', 'High_Low_Pct', 'Close_Open_Pct',
            'SMA_5', 'SMA_10', 'SMA_20', 'SMA_50',
            'EMA_12', 'EMA_26', 'MACD', 'MACD_Signal',
            'RSI', 'BB_Width', 'Volatility', 'Volume_Ratio'
        ]
        
        recent_data = df[feature_columns].tail(self.lookback_days).values
        scaled_data = self.feature_scaler.transform(recent_data)
        X_pred = np.array([scaled_data])
        
        if self.model is None:
            self.load_model()
        
        predicted_change = self.model.predict(X_pred, verbose=0)[0][0]
        current_price = df['Close'].iloc[-1]
        predicted_price = current_price * (1 + predicted_change)
        
        if predicted_change >= self.buy_threshold:
            action = "BUY"
            confidence = "HIGH" if predicted_change >= 0.05 else "MEDIUM"
        elif predicted_change <= self.sell_threshold:
            action = "SELL"
            confidence = "HIGH" if predicted_change <= -0.05 else "MEDIUM"
        else:
            action = "HOLD"
            confidence = "MEDIUM"
        
        latest_indicators = {
            'RSI': float(df['RSI'].iloc[-1]),
            'MACD': float(df['MACD'].iloc[-1]),
            'Volatility': float(df['Volatility'].iloc[-1]),
            'Volume_Ratio': float(df['Volume_Ratio'].iloc[-1])
        }
        
        return {
            'symbol': self.symbol,
            'current_price': float(current_price),
            'predicted_price': float(predicted_price),
            'predicted_change_pct': float(predicted_change * 100),
            'action': action,
            'confidence': confidence,
            'timestamp': datetime.now().isoformat(),
            'technical_indicators': latest_indicators,
            'reasoning': self._generate_reasoning(action, predicted_change, latest_indicators)
        }
    
    def _generate_reasoning(self, action, predicted_change, indicators):
        reasons = []
        if action == "BUY":
            reasons.append(f"Model predicts {predicted_change*100:.2f}% price increase")
            if indicators['RSI'] < 30:
                reasons.append("RSI indicates oversold conditions")
            if indicators['MACD'] > 0:
                reasons.append("MACD shows bullish momentum")
        elif action == "SELL":
            reasons.append(f"Model predicts {predicted_change*100:.2f}% price decrease")
            if indicators['RSI'] > 70:
                reasons.append("RSI indicates overbought conditions")
            if indicators['MACD'] < 0:
                reasons.append("MACD shows bearish momentum")
        else:
            reasons.append(f"Predicted change ({predicted_change*100:.2f}%) is within hold threshold")
            reasons.append("Market conditions suggest waiting for clearer signals")
        if indicators['Volatility'] > 0.05:
            reasons.append("High volatility detected - exercise caution")
        return reasons
    
    def save_model(self):
        model_file = f'{self.model_path}{self.symbol.replace("-", "_")}_model.keras'
        scaler_file = f'{self.model_path}{self.symbol.replace("-", "_")}_scaler.pkl'
        self.model.save(model_file)
        import pickle
        with open(scaler_file, 'wb') as f:
            pickle.dump(self.feature_scaler, f)
        print(f"💾 Model saved to {model_file}")

    def load_model(self):
        model_file = f'{self.model_path}{self.symbol.replace("-", "_")}_model.keras'
        scaler_file = f'{self.model_path}{self.symbol.replace("-", "_")}_scaler.pkl'
        if not os.path.exists(model_file):
            raise FileNotFoundError(f"Model not found for {self.symbol}. Please train it first.")
        
        self.model = load_model(model_file)
        import pickle
        with open(scaler_file, 'rb') as f:
            self.feature_scaler = pickle.load(f)
        print(f"✅ Model loaded from {model_file}")


def main():
    print("="*70)
    print("🤖 LSTM CRYPTO TRADING PREDICTOR")
    print("="*70)

    print("\n📚 Menu:")
    print("1. Train new model")
    print("2. Load model and get prediction")
    choice = input("\nChoose option (1-2): ").strip()
    symbol = input("Enter crypto symbol (e.g., BTC-USD, ETH-USD): ").strip().upper()
    if '-USD' not in symbol:
        symbol = f"{symbol}-USD"
    
    predictor = CryptoLSTMPredictor(symbol)

    if choice == '1':
        print("\n🚀 Starting training...")
        predictor.train(epochs=50, batch_size=32)
        print("\n✅ Training complete!")

    elif choice == '2':
        try:
            predictor.load_model()
            prediction = predictor.predict_next_move()
            print("\n" + "="*70)
            print("🔮 PREDICTION RESULTS")
            print("="*70)
            print(json.dumps(prediction, indent=2))
            print("="*70)
        except FileNotFoundError:
            print("\n❌ No trained model found. Please train first (option 1).")
    else:
        print("\n❌ Invalid choice. Exiting.")


if __name__ == "__main__":
    main()

       
