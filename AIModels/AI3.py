import yfinance as yf
import pandas as pd
from datetime import datetime
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()

bull_agent = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.9)
bear_agent = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.3)


class CryptoDataFetcher:
    """Fetches real-time crypto market data"""
    
    @staticmethod
    def get_market_data(symbol):
        """Get detailed market data for a cryptocurrency"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period='30d', auto_adjust=True, progress=False)
            
            if isinstance(hist.columns, pd.MultiIndex):
                hist.columns = hist.columns.get_level_values(0)
            
            if len(hist) > 1:
                current_price = hist['Close'].iloc[-1]
                month_start_price = hist['Close'].iloc[0]
                month_change = ((current_price - month_start_price) / month_start_price) * 100
                month_high = hist['High'].max()
                month_low = hist['Low'].min()
                avg_volume = hist['Volume'].mean()
                
                daily_returns = hist['Close'].pct_change()
                volatility = daily_returns.std() * 100
                
                hist['SMA_7'] = hist['Close'].rolling(window=7).mean()
                hist['SMA_30'] = hist['Close'].rolling(window=30).mean()
                
                sma_7 = hist['SMA_7'].iloc[-1] if len(hist) >= 7 else current_price
                sma_30 = hist['SMA_30'].iloc[-1] if len(hist) >= 30 else current_price
                
                if current_price > sma_7 > sma_30:
                    trend = "Strong Bullish"
                elif current_price > sma_7:
                    trend = "Bullish"
                elif current_price < sma_7 < sma_30:
                    trend = "Strong Bearish"
                elif current_price < sma_7:
                    trend = "Bearish"
                else:
                    trend = "Neutral"
                
                return {
                    'symbol': symbol,
                    'current_price': current_price,
                    'month_change': month_change,
                    'month_high': month_high,
                    'month_low': month_low,
                    'avg_volume': avg_volume,
                    'volatility': volatility,
                    'trend': trend,
                    'sma_7': sma_7,
                    'sma_30': sma_30
                }
            return None
        except Exception as e:
            print(f"❌ Error fetching data: {e}")
            return None
    
    @staticmethod
    def parse_crypto_symbol(message):
        """Extract cryptocurrency symbol from user message"""
        message_upper = message.upper()
        
        crypto_map = {
            'BTC': 'BTC-USD', 'BITCOIN': 'BTC-USD',
            'ETH': 'ETH-USD', 'ETHEREUM': 'ETH-USD',
            'SOL': 'SOL-USD', 'SOLANA': 'SOL-USD',
            'BNB': 'BNB-USD', 'BINANCE': 'BNB-USD',
            'XRP': 'XRP-USD', 'RIPPLE': 'XRP-USD',
            'ADA': 'ADA-USD', 'CARDANO': 'ADA-USD',
            'DOGE': 'DOGE-USD', 'DOGECOIN': 'DOGE-USD',
            'MATIC': 'MATIC-USD', 'POLYGON': 'MATIC-USD',
            'DOT': 'DOT-USD', 'POLKADOT': 'DOT-USD',
            'AVAX': 'AVAX-USD', 'AVALANCHE': 'AVAX-USD'
        }
        
        for key, value in crypto_map.items():
            if key in message_upper.split():
                return value
        
        return None


class DualAgentDebate:
    """Two AI agents that debate about cryptocurrency"""
    
    def __init__(self):
        self.bull_agent = bull_agent
        self.bear_agent = bear_agent
        self.data_fetcher = CryptoDataFetcher()
    
    def start_debate(self, user_question, crypto_symbol=None):
        """Start the debate between Bull and Bear agents"""
        
        market_data = None
        if crypto_symbol:
            print(f"\n📊 Fetching market data for {crypto_symbol}...")
            market_data = self.data_fetcher.get_market_data(crypto_symbol)
            
            if market_data:
                self._display_market_data(market_data)
        
        context = self._format_context(user_question, market_data)
        
        print("\n" + "="*70)
        print("🎭 AGENT DEBATE SESSION")
        print("="*70)
        
        print("\n🐂 BULL AGENT (Optimistic Perspective)")
        print("-" * 70)
        bull_round1 = self._get_bull_opinion(context, round_num=1)
        print(bull_round1)
        
        print("\n🐻 BEAR AGENT (Cautious Perspective)")
        print("-" * 70)
        bear_round1 = self._get_bear_opinion(context, round_num=1)
        print(bear_round1)
        
        print("\n🐂 BULL AGENT - Responding to Bear's Concerns")
        print("-" * 70)
        bull_round2 = self._bull_responds_to_bear(context, bear_round1)
        print(bull_round2)
        
        print("\n🐻 BEAR AGENT - Counter-Arguments")
        print("-" * 70)
        bear_round2 = self._bear_responds_to_bull(context, bull_round2)
        print(bear_round2)
        
        print("\n" + "="*70)
        print("📊 BALANCED ANALYSIS")
        print("="*70)
        summary = self._generate_summary(user_question, bull_round2, bear_round2, market_data)
        print(summary)
        print("\n" + "="*70)
    
    def _format_context(self, user_question, market_data):
        """Format context for agents"""
        context = f"USER QUESTION: {user_question}\n\n"
        
        if market_data:
            context += f"""MARKET DATA FOR {market_data['symbol']}:
- Current Price: ${market_data['current_price']:,.2f}
- 30-Day Change: {market_data['month_change']:+.2f}%
- 30-Day High: ${market_data['month_high']:,.2f}
- 30-Day Low: ${market_data['month_low']:,.2f}
- Volatility: {market_data['volatility']:.2f}%
- Trend: {market_data['trend']}
- 7-Day SMA: ${market_data['sma_7']:,.2f}
- 30-Day SMA: ${market_data['sma_30']:,.2f}
"""
        
        return context
    
    def _display_market_data(self, data):
        """Display market data in a nice format"""
        print(f"\n📈 Market Data for {data['symbol']}")
        print(f"  💰 Price: ${data['current_price']:,.2f}")
        print(f"  📊 30D Change: {data['month_change']:+.2f}%")
        print(f"  📈 30D High: ${data['month_high']:,.2f}")
        print(f"  📉 30D Low: ${data['month_low']:,.2f}")
        print(f"  🎲 Volatility: {data['volatility']:.2f}%")
        print(f"  📉 Trend: {data['trend']}")
    
    def _get_bull_opinion(self, context, round_num):
        """Get Bull Agent's optimistic opinion"""
        prompt = f"""You are the BULL AGENT - an optimistic cryptocurrency enthusiast with these traits:

PERSONALITY:
- You're excited about crypto's potential and innovation
- You focus on growth opportunities and positive trends
- You believe in long-term value appreciation
- You see market dips as buying opportunities
- You emphasize adoption, technology, and future potential
- You're encouraging but acknowledge risks exist

TASK: Provide your optimistic analysis of the situation.

{context}

Give a 2-3 paragraph response highlighting:
1. Why this is a good opportunity
2. Positive market signals
3. Long-term potential
4. Any risks (briefly)

Be enthusiastic but rational."""
        
        response = self.bull_agent.invoke(prompt)
        return response.content
    
    def _get_bear_opinion(self, context, round_num):
        """Get Bear Agent's pessimistic opinion"""
        prompt = f"""You are the BEAR AGENT - a cautious, risk-aware crypto skeptic with these traits:

PERSONALITY:
- You're skeptical and focus on risks
- You emphasize volatility, regulation concerns, and market uncertainties
- You prefer capital preservation over risky gains
- You question hype and warn about FOMO
- You point out potential downsides and worst-case scenarios
- You're protective but not entirely negative

TASK: Provide your cautious analysis of the situation.

{context}

Give a 2-3 paragraph response highlighting:
1. Major risks and concerns
2. Negative market signals or red flags
3. Why caution is warranted
4. Alternative safer approaches

Be skeptical but fair."""
        
        response = self.bear_agent.invoke(prompt)
        return response.content
    
    def _bull_responds_to_bear(self, context, bear_opinion):
        """Bull Agent responds to Bear's concerns"""
        prompt = f"""You are the BULL AGENT responding to the Bear Agent's concerns.

{context}

BEAR AGENT'S CONCERNS:
{bear_opinion}

TASK: Counter the Bear's arguments while:
- Acknowledging valid points respectfully
- Explaining why risks are manageable or overstated
- Providing optimistic counter-perspectives
- Showing why opportunity outweighs risk

Give a 2 paragraph response. Be confident but respectful."""
        
        response = self.bull_agent.invoke(prompt)
        return response.content
    
    def _bear_responds_to_bull(self, context, bull_opinion):
        """Bear Agent responds to Bull's arguments"""
        prompt = f"""You are the BEAR AGENT responding to the Bull Agent's optimism.

{context}

BULL AGENT'S ARGUMENTS:
{bull_opinion}

TASK: Counter the Bull's optimism while:
- Acknowledging valid points respectfully
- Pointing out overlooked or downplayed risks
- Explaining why caution is still necessary
- Providing realistic worst-case scenarios

Give a 2 paragraph response. Be firm but respectful."""
        
        response = self.bear_agent.invoke(prompt)
        return response.content
    
    def _generate_summary(self, user_question, bull_final, bear_final, market_data):
        """Generate a balanced summary of both perspectives"""
        prompt = f"""You are a NEUTRAL financial analyst synthesizing two opposing viewpoints on cryptocurrency.

USER QUESTION: {user_question}

BULL AGENT (Optimistic): {bull_final}

BEAR AGENT (Cautious): {bear_final}

TASK: Provide a balanced summary that:
1. Acknowledges key points from both agents
2. Gives a clear recommendation (Strong Buy / Buy / Hold / Sell / Strong Sell)
3. Suggests risk management strategies
4. Lists 2-3 critical factors to monitor

Write 3-4 concise paragraphs. Be balanced and actionable."""
        
        response = bull_agent.invoke(prompt)
        return response.content


def main():
    """Main chatbot loop"""
    print("="*70)
    print("🎭 DUAL AGENT CRYPTO DEBATE SYSTEM")
    print("="*70)
    print("\n🐂 Bull Agent: Optimistic, growth-focused, opportunity-seeker")
    print("🐻 Bear Agent: Cautious, risk-aware, skeptical protector")
    print("\n💡 Ask any crypto question and watch them debate!")
    print("   Examples:")
    print("   - Should I buy Bitcoin?")
    print("   - Is Ethereum a good investment?")
    print("   - What do you think about Solana?")
    print("   - Is now a good time to invest in crypto?")
    print("\nType 'quit' or 'exit' to end.\n")
    
    debate_system = DualAgentDebate()
    
    while True:
        try:
            user_input = input("You: ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['quit', 'exit', 'bye', 'q']:
                print("\n👋 Thanks for using the Dual Agent Debate System! Goodbye!")
                break
            
            crypto_symbol = debate_system.data_fetcher.parse_crypto_symbol(user_input)
            
            debate_system.start_debate(user_input, crypto_symbol)
            
            print() 
            
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
            print("Please try again.\n")


if __name__ == "__main__":
    main()