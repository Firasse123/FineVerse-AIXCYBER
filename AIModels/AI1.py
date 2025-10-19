import os
import pandas as pd
import yfinance as yf
from datetime import datetime
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

# Load environment variables
load_dotenv()

# Initialize LLM
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0)  # type: ignore

def get_crypto_data(ticker, start, end):
    """Fetch cryptocurrency data from Yahoo Finance."""
    print(f"Fetching {ticker} data from {start} to {end}...")
    df = yf.download(ticker, start=start, end=end, auto_adjust=True, progress=False)

    # Flatten column names if multi-level
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df.dropna(inplace=True)

    if df.empty:
        raise ValueError(f"No data returned for {ticker}")

    print(f"✓ Successfully fetched {len(df)} data points")
    return df

def calculate_technical_indicators(df):
    """Calculate technical indicators for crypto analysis."""
    df = df.copy()

    # Ensure simple column names
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    if 'Close' not in df.columns:
        raise ValueError("DataFrame must have a 'Close' column")

    close_prices = df['Close'].squeeze()

    # Simple Moving Averages
    df['SMA_7'] = close_prices.rolling(window=7).mean()
    df['SMA_30'] = close_prices.rolling(window=30).mean()
    df['SMA_50'] = close_prices.rolling(window=50).mean()

    # Exponential Moving Averages
    df['EMA_12'] = close_prices.ewm(span=12, adjust=False).mean()
    df['EMA_26'] = close_prices.ewm(span=26, adjust=False).mean()

    # MACD
    df['MACD'] = df['EMA_12'] - df['EMA_26']
    df['Signal_Line'] = df['MACD'].ewm(span=9, adjust=False).mean()

    # RSI
    delta = close_prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))

    # Bollinger Bands
    bb_middle = close_prices.rolling(window=20).mean()
    bb_std = close_prices.rolling(window=20).std()
    df['BB_Middle'] = bb_middle
    df['BB_Upper'] = bb_middle + (bb_std * 2)
    df['BB_Lower'] = bb_middle - (bb_std * 2)

    # Daily returns and volatility
    df['Daily_Return'] = close_prices.pct_change() * 100
    df['Volatility'] = df['Daily_Return'].rolling(window=30).std()

    return df

def get_summary_metrics(df):
    """Calculate summary metrics from crypto data."""
    latest_price = df['Close'].iloc[-1]
    first_price = df['Close'].iloc[0]
    price_change_pct = ((latest_price - first_price) / first_price) * 100

    latest_rsi = df['RSI'].iloc[-1] if 'RSI' in df.columns else None
    latest_macd = df['MACD'].iloc[-1] if 'MACD' in df.columns else None
    latest_signal = df['Signal_Line'].iloc[-1] if 'Signal_Line' in df.columns else None

    sma_7 = df['SMA_7'].iloc[-1] if 'SMA_7' in df.columns else None
    sma_30 = df['SMA_30'].iloc[-1] if 'SMA_30' in df.columns else None

    trend = "Neutral"
    if sma_7 and sma_30:
        if latest_price > sma_7 > sma_30:
            trend = "Strong Bullish"
        elif latest_price > sma_7 and sma_7 < sma_30:
            trend = "Weakening Bullish"
        elif latest_price < sma_7 < sma_30:
            trend = "Strong Bearish"
        elif latest_price < sma_7 and sma_7 > sma_30:
            trend = "Weakening Bearish"

    return {
        'current_price': latest_price,
        'start_price': first_price,
        'price_change_pct': price_change_pct,
        'highest_price': df['High'].max(),
        'lowest_price': df['Low'].min(),
        'avg_volume': df['Volume'].mean(),
        'latest_rsi': latest_rsi,
        'latest_macd': latest_macd,
        'latest_signal': latest_signal,
        'sma_7': sma_7,
        'sma_30': sma_30,
        'trend': trend,
        'volatility': df['Volatility'].iloc[-1] if 'Volatility' in df.columns else None
    }

def analyze_with_ai(ticker, metrics, df):
    """Get AI-powered analysis using Gemini."""
    rsi_signal = "Neutral"
    if metrics['latest_rsi']:
        if metrics['latest_rsi'] > 70:
            rsi_signal = "Overbought (potential sell signal)"
        elif metrics['latest_rsi'] < 30:
            rsi_signal = "Oversold (potential buy signal)"

    macd_signal = "Neutral"
    if metrics['latest_macd'] and metrics['latest_signal']:
        if metrics['latest_macd'] > metrics['latest_signal']:
            macd_signal = "Bullish (MACD above signal line)"
        else:
            macd_signal = "Bearish (MACD below signal line)"

    rsi_str = f"{metrics['latest_rsi']:.2f}" if metrics['latest_rsi'] else 'N/A'
    macd_str = f"{metrics['latest_macd']:.4f}" if metrics['latest_macd'] else 'N/A'
    sma7_str = f"${metrics['sma_7']:.2f}" if metrics['sma_7'] else 'N/A'
    sma30_str = f"${metrics['sma_30']:.2f}" if metrics['sma_30'] else 'N/A'
    vol_str = f"{metrics['volatility']:.2f}%" if metrics['volatility'] else 'N/A'

    prompt = f"""Analyze the following cryptocurrency data for {ticker}:

PRICE ANALYSIS:
- Current Price: ${metrics['current_price']:.2f}
- Period Change: {metrics['price_change_pct']:.2f}%
- Period High: ${metrics['highest_price']:.2f}
- Period Low: ${metrics['lowest_price']:.2f}
- Average Daily Volume: {metrics['avg_volume']:,.0f}

TECHNICAL INDICATORS:
- Trend: {metrics['trend']}
- RSI (14): {rsi_str} - {rsi_signal}
- MACD: {macd_str} - {macd_signal}
- 7-Day SMA: {sma7_str}
- 30-Day SMA: {sma30_str}
- Volatility: {vol_str}

DATA PERIOD: {len(df)} trading days

Please provide:
1. Overall market sentiment (bullish/bearish/neutral) with reasoning
2. Key support and resistance levels
3. Short-term trading recommendation (buy/sell/hold)
4. Risk factors to consider
5. Potential price targets

Keep the analysis concise and actionable."""

    print("\n🤖 Generating AI analysis with Gemini...")
    response = llm.invoke(prompt)
    return response.content

def main():
    """Main execution function."""
    CRYPTO_TICKERS = {
        'BTC-USD': 'Bitcoin',
        'ETH-USD': 'Ethereum',
        'BNB-USD': 'Binance Coin',
        'SOL-USD': 'Solana',
        'XRP-USD': 'Ripple',
        'ADA-USD': 'Cardano'
    }

    ticker = 'AAPL'
    start_date = '2024-01-01'
    end_date = datetime.now().strftime('%Y-%m-%d')

    print("="*70)
    print(f"🔍 CRYPTO ANALYSIS: {CRYPTO_TICKERS.get(ticker, ticker)}")
    print("="*70)

    try:
        data = get_crypto_data(ticker, start_date, end_date)
        print("\n📊 Calculating technical indicators...")
        data_with_indicators = calculate_technical_indicators(data)
        print("📈 Computing summary metrics...")
        metrics = get_summary_metrics(data_with_indicators)

        print("\n" + "="*70)
        print("📋 SUMMARY METRICS")
        print("="*70)
        print(f"Current Price:    ${metrics['current_price']:,.2f}")
        print(f"Period Change:    {metrics['price_change_pct']:+.2f}%")
        print(f"Trend:            {metrics['trend']}")
        print(f"RSI (14):         {metrics['latest_rsi']:.2f}" if metrics['latest_rsi'] else "N/A")
        print(f"Volume (avg):     {metrics['avg_volume']:,.0f}")

        print("\n" + "="*70)
        print("🤖 AI ANALYSIS")
        print("="*70)
        ai_analysis = analyze_with_ai(ticker, metrics, data_with_indicators)
        print(ai_analysis)

        print("\n" + "="*70)
        print("📊 RECENT DATA (Last 5 days)")
        print("="*70)
        recent_cols = ['Close', 'Volume', 'RSI', 'MACD', 'SMA_7', 'SMA_30']
        available_cols = [col for col in recent_cols if col in data_with_indicators.columns]
        print(data_with_indicators[available_cols].tail())

    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nTroubleshooting:")
        print("1. Check your internet connection")
        print("2. Verify the ticker symbol is correct")
        print("3. Ensure your GOOGLE_API_KEY is set in .env")

if __name__ == "__main__":
    main()
