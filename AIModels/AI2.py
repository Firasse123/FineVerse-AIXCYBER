import os
import json
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate

# Load environment variables
load_dotenv()

# Initialize LLM
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)

# Initialize conversation memory
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

class CryptoPortfolio:
    """Manages user's cryptocurrency portfolio"""
    
    def __init__(self, user_id):
        self.user_id = user_id
        self.portfolio = self.load_portfolio()
        self.balance = self.portfolio.get('balance', 10000.0)  # Starting balance
        self.holdings = self.portfolio.get('holdings', {})
        self.transaction_history = self.portfolio.get('transactions', [])
    
    def load_portfolio(self):
        """Load portfolio from file"""
        try:
            with open(f'portfolio_{self.user_id}.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {'balance': 10000.0, 'holdings': {}, 'transactions': []}
    
    def save_portfolio(self):
        """Save portfolio to file"""
        portfolio_data = {
            'balance': self.balance,
            'holdings': self.holdings,
            'transactions': self.transaction_history
        }
        with open(f'portfolio_{self.user_id}.json', 'w') as f:
            json.dump(portfolio_data, f, indent=2)
    
    def get_current_price(self, symbol):
        """Get current price of cryptocurrency"""
        try:
            ticker = yf.Ticker(symbol)
            data = ticker.history(period='1d')
            if not data.empty:
                return data['Close'].iloc[-1]
            return None
        except:
            return None
    
    def buy_crypto(self, symbol, amount_usd):
        """Buy cryptocurrency"""
        price = self.get_current_price(symbol)
        if price is None:
            return {"success": False, "message": f"Could not fetch price for {symbol}"}
        
        if amount_usd > self.balance:
            return {"success": False, "message": f"Insufficient balance. Available: ${self.balance:.2f}"}
        
        quantity = amount_usd / price
        
        # Update holdings
        if symbol in self.holdings:
            self.holdings[symbol]['quantity'] += quantity
            self.holdings[symbol]['avg_price'] = (
                (self.holdings[symbol]['avg_price'] * (self.holdings[symbol]['quantity'] - quantity) + 
                 price * quantity) / self.holdings[symbol]['quantity']
            )
        else:
            self.holdings[symbol] = {
                'quantity': quantity,
                'avg_price': price
            }
        
        # Update balance
        self.balance -= amount_usd
        
        # Record transaction
        transaction = {
            'type': 'buy',
            'symbol': symbol,
            'quantity': quantity,
            'price': price,
            'amount_usd': amount_usd,
            'timestamp': datetime.now().isoformat()
        }
        self.transaction_history.append(transaction)
        
        self.save_portfolio()
        
        return {
            "success": True,
            "message": f"Successfully bought {quantity:.6f} of {symbol} at ${price:.2f}",
            "transaction": transaction
        }
    
    def sell_crypto(self, symbol, quantity):
        """Sell cryptocurrency"""
        if symbol not in self.holdings:
            return {"success": False, "message": f"You don't own any {symbol}"}
        
        if quantity > self.holdings[symbol]['quantity']:
            return {
                "success": False, 
                "message": f"Insufficient quantity. You have {self.holdings[symbol]['quantity']:.6f} {symbol}"
            }
        
        price = self.get_current_price(symbol)
        if price is None:
            return {"success": False, "message": f"Could not fetch price for {symbol}"}
        
        amount_usd = quantity * price
        
        # Update holdings
        self.holdings[symbol]['quantity'] -= quantity
        if self.holdings[symbol]['quantity'] < 0.000001:  # Remove if negligible
            del self.holdings[symbol]
        
        # Update balance
        self.balance += amount_usd
        
        # Record transaction
        transaction = {
            'type': 'sell',
            'symbol': symbol,
            'quantity': quantity,
            'price': price,
            'amount_usd': amount_usd,
            'timestamp': datetime.now().isoformat()
        }
        self.transaction_history.append(transaction)
        
        self.save_portfolio()
        
        return {
            "success": True,
            "message": f"Successfully sold {quantity:.6f} of {symbol} at ${price:.2f}",
            "transaction": transaction
        }
    
    def get_portfolio_value(self):
        """Calculate total portfolio value"""
        total_crypto_value = 0
        holdings_detail = []
        
        for symbol, holding in self.holdings.items():
            current_price = self.get_current_price(symbol)
            if current_price:
                value = holding['quantity'] * current_price
                total_crypto_value += value
                profit_loss = (current_price - holding['avg_price']) * holding['quantity']
                profit_loss_pct = ((current_price - holding['avg_price']) / holding['avg_price']) * 100
                
                holdings_detail.append({
                    'symbol': symbol,
                    'quantity': holding['quantity'],
                    'avg_price': holding['avg_price'],
                    'current_price': current_price,
                    'value': value,
                    'profit_loss': profit_loss,
                    'profit_loss_pct': profit_loss_pct
                })
        
        total_value = self.balance + total_crypto_value
        
        return {
            'cash_balance': self.balance,
            'crypto_value': total_crypto_value,
            'total_value': total_value,
            'holdings': holdings_detail
        }
    
    def get_transaction_history(self, limit=10):
        """Get recent transaction history"""
        return self.transaction_history[-limit:]


class FintechChatbot:
    """AI-powered fintech chatbot"""
    
    def __init__(self, user_id="default_user"):
        self.portfolio = CryptoPortfolio(user_id)
        self.llm = llm
        
        # Define system prompt
        self.system_prompt = PromptTemplate(
            input_variables=["user_message", "portfolio_info"],
            template="""You are a helpful AI assistant for a cryptocurrency fintech platform. 
You help users with:
- Cryptocurrency trading (buying/selling)
- Portfolio analysis and management
- Market insights and price checking
- Transaction history
- Financial advice

Current User Portfolio:
{portfolio_info}

User Message: {user_message}

Provide helpful, accurate, and friendly responses. If the user wants to perform a transaction, 
acknowledge it and explain what will happen. Be conversational and supportive.

For price checks, market analysis, or general crypto questions, provide detailed insights.
Always mention risks when appropriate."""
        )
    
    def get_crypto_price(self, symbol):
        """Get current cryptocurrency price and info"""
        price = self.portfolio.get_current_price(symbol)
        if price is None:
            return f"Sorry, I couldn't fetch the price for {symbol}"
        
        # Get additional data
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period='7d')
            
            if len(hist) > 1:
                week_change = ((hist['Close'].iloc[-1] - hist['Close'].iloc[0]) / hist['Close'].iloc[0]) * 100
                week_high = hist['High'].max()
                week_low = hist['Low'].min()
                
                return f"""
📊 {symbol} Market Data:
• Current Price: ${price:,.2f}
• 7-Day Change: {week_change:+.2f}%
• 7-Day High: ${week_high:,.2f}
• 7-Day Low: ${week_low:,.2f}
• Volume: {info.get('volume', 'N/A'):,}
"""
            else:
                return f"Current price of {symbol}: ${price:,.2f}"
        except:
            return f"Current price of {symbol}: ${price:,.2f}"
    
    def process_message(self, user_message):
        """Process user message and generate response"""
        user_message_lower = user_message.lower()
        
        # Check for specific commands
        if any(word in user_message_lower for word in ['buy', 'purchase']):
            return self.handle_buy_intent(user_message)
        
        elif any(word in user_message_lower for word in ['sell']):
            return self.handle_sell_intent(user_message)
        
        elif any(word in user_message_lower for word in ['portfolio', 'holdings', 'balance']):
            return self.show_portfolio()
        
        elif any(word in user_message_lower for word in ['history', 'transactions']):
            return self.show_transaction_history()
        
        elif any(word in user_message_lower for word in ['price', 'value', 'worth']):
            return self.handle_price_check(user_message)
        
        else:
            # General conversation with AI
            return self.ai_conversation(user_message)
    
    def handle_buy_intent(self, message):
        """Handle buy requests"""
        # Simple parsing (in production, use NLP or structured input)
        words = message.upper().split()
        
        # Look for crypto symbols (BTC, ETH, etc.)
        crypto_symbols = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD', 'ADA-USD']
        symbol = None
        for s in crypto_symbols:
            if s.split('-')[0] in words:
                symbol = s
                break
        
        # Look for amount
        amount = None
        for i, word in enumerate(words):
            if word.replace('.', '').isdigit():
                amount = float(word)
                break
            if word == '$' and i+1 < len(words) and words[i+1].replace('.', '').isdigit():
                amount = float(words[i+1])
                break
        
        if not symbol or not amount:
            return """To buy cryptocurrency, please specify:
1. The cryptocurrency (BTC, ETH, SOL, BNB, XRP, ADA)
2. The amount in USD

Example: "Buy $500 worth of BTC" or "Buy BTC for $500"
"""
        
        result = self.portfolio.buy_crypto(symbol, amount)
        
        if result['success']:
            return f"""✅ Transaction Successful!

{result['message']}

💰 New Balance: ${self.portfolio.balance:.2f}
📊 {symbol} Holdings: {self.portfolio.holdings[symbol]['quantity']:.6f}
"""
        else:
            return f"❌ Transaction Failed: {result['message']}"
    
    def handle_sell_intent(self, message):
        """Handle sell requests"""
        words = message.upper().split()
        
        # Look for crypto symbols
        crypto_symbols = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD', 'ADA-USD']
        symbol = None
        for s in crypto_symbols:
            if s.split('-')[0] in words:
                symbol = s
                break
        
        # Look for quantity or "all"
        if 'ALL' in words:
            if symbol and symbol in self.portfolio.holdings:
                quantity = self.portfolio.holdings[symbol]['quantity']
            else:
                return f"You don't own any {symbol}"
        else:
            quantity = None
            for word in words:
                if word.replace('.', '').isdigit():
                    quantity = float(word)
                    break
        
        if not symbol or not quantity:
            return """To sell cryptocurrency, please specify:
1. The cryptocurrency (BTC, ETH, SOL, BNB, XRP, ADA)
2. The quantity or "all"

Example: "Sell 0.5 BTC" or "Sell all ETH"
"""
        
        result = self.portfolio.sell_crypto(symbol, quantity)
        
        if result['success']:
            return f"""✅ Transaction Successful!

{result['message']}

💰 New Balance: ${self.portfolio.balance:.2f}
"""
        else:
            return f"❌ Transaction Failed: {result['message']}"
    
    def show_portfolio(self):
        """Display portfolio summary"""
        portfolio_data = self.portfolio.get_portfolio_value()
        
        response = f"""
📊 Your Portfolio Summary
{'='*50}

💵 Cash Balance: ${portfolio_data['cash_balance']:,.2f}
💎 Crypto Value: ${portfolio_data['crypto_value']:,.2f}
💰 Total Value: ${portfolio_data['total_value']:,.2f}

"""
        
        if portfolio_data['holdings']:
            response += "🪙 Holdings:\n"
            for holding in portfolio_data['holdings']:
                profit_emoji = "📈" if holding['profit_loss'] > 0 else "📉"
                response += f"""
  {holding['symbol']}:
    • Quantity: {holding['quantity']:.6f}
    • Avg Buy Price: ${holding['avg_price']:,.2f}
    • Current Price: ${holding['current_price']:,.2f}
    • Value: ${holding['value']:,.2f}
    • P/L: ${holding['profit_loss']:+,.2f} ({holding['profit_loss_pct']:+.2f}%) {profit_emoji}
"""
        else:
            response += "No cryptocurrency holdings yet.\n"
        
        return response
    
    def show_transaction_history(self):
        """Display recent transactions"""
        transactions = self.portfolio.get_transaction_history(10)
        
        if not transactions:
            return "No transactions yet."
        
        response = "📜 Recent Transactions:\n" + "="*50 + "\n\n"
        
        for trans in reversed(transactions):
            emoji = "🟢" if trans['type'] == 'buy' else "🔴"
            response += f"""{emoji} {trans['type'].upper()} {trans['symbol']}
  • Quantity: {trans['quantity']:.6f}
  • Price: ${trans['price']:,.2f}
  • Amount: ${trans['amount_usd']:,.2f}
  • Time: {trans['timestamp']}

"""
        
        return response
    
    def handle_price_check(self, message):
        """Handle price check requests"""
        words = message.upper().split()
        
        crypto_symbols = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD', 'ADA-USD']
        symbol = None
        for s in crypto_symbols:
            if s.split('-')[0] in words:
                symbol = s
                break
        
        if symbol:
            return self.get_crypto_price(symbol)
        else:
            return "Please specify a cryptocurrency (BTC, ETH, SOL, BNB, XRP, ADA)"
    
    def ai_conversation(self, user_message):
        """Handle general conversation with AI"""
        portfolio_info = f"""
Cash Balance: ${self.portfolio.balance:.2f}
Holdings: {', '.join([f"{k}: {v['quantity']:.4f}" for k, v in self.portfolio.holdings.items()]) if self.portfolio.holdings else 'None'}
"""
        
        prompt = self.system_prompt.format(
            user_message=user_message,
            portfolio_info=portfolio_info
        )
        
        response = self.llm.invoke(prompt)
        return response.content


def main():
    """Main chatbot loop"""
    print("="*70)
    print("🚀 Welcome to FinTech Crypto Assistant!")
    print("="*70)
    print("\nI can help you with:")
    print("  • Buy/Sell cryptocurrency")
    print("  • Check your portfolio")
    print("  • View transaction history")
    print("  • Get price updates")
    print("  • Market analysis and advice")
    print("\nType 'quit' or 'exit' to end the conversation.\n")
    
    # Initialize chatbot
    chatbot = FintechChatbot(user_id="user123")
    
    while True:
        try:
            user_input = input("You: ").strip()
            
            if not user_input:
                continue
            
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("\nThank you for using FinTech Crypto Assistant! Goodbye! 👋")
                break
            
            # Process message
            response = chatbot.process_message(user_input)
            print(f"\nAssistant: {response}\n")
            
        except KeyboardInterrupt:
            print("\n\nGoodbye! 👋")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}\n")


if __name__ == "__main__":
    main()