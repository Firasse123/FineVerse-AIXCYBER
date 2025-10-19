# 🎮 AIxCyber Financial Simulator - Complete Architecture

## 🎯 Project Vision
A **gamified metaverse-style fintech learning platform** where players create personalized financial avatars, navigate an interactive financial world, receive AI-powered guidance, and manage real financial simulations across multiple asset classes while defending against cyber threats.

---

## 📁 FINAL PROJECT STRUCTURE

```
aixcyber-platform/
│
├── 📦 BACKEND (Node.js + Express + MongoDB)
│   ├── server/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── auth.js
│   │   │   └── env.js
│   │   │
│   │   ├── models/
│   │   │   ├── User.js              # Player profile, risk profile, KYC
│   │   │   ├── Avatar.js            # Avatar customization
│   │   │   ├── Portfolio.js         # Holdings, transactions
│   │   │   ├── Transaction.js       # Trade history (blockchain linked)
│   │   │   ├── CyberThreat.js       # Threat incidents
│   │   │   ├── Achievement.js       # Badges & accomplishments
│   │   │   ├── News.js              # News articles with sentiment
│   │   │   └── Leaderboard.js       # Rankings
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js              # Login, signup, KYC
│   │   │   ├── avatar.js            # Avatar creation/customization
│   │   │   ├── portfolio.js         # Buy/sell, holdings
│   │   │   ├── market.js            # Price feeds, technical indicators
│   │   │   ├── news.js              # News feed, sentiment analysis
│   │   │   ├── ai.js                # AI recommendations
│   │   │   ├── security.js          # Threat management, 2FA
│   │   │   ├── leaderboard.js       # Rankings
│   │   │   └── achievements.js      # Missions & rewards
│   │   │
│   │   ├── services/
│   │   │   ├── marketService.js     # Price simulation, technical analysis
│   │   │   ├── aiService.js         # Risk profiling, recommendations
│   │   │   ├── nlpService.js        # Article summarization (LLM)
│   │   │   ├── podcastService.js    # Podcast generation from articles
│   │   │   ├── sentimentService.js  # Market sentiment analysis
│   │   │   ├── securityService.js   # Threat generation & validation
│   │   │   ├── blockchainService.js # Transaction ledger (immutable)
│   │   │   ├── notebookLLMService.js # Google Notebook LLM integration
│   │   │   └── newsService.js       # News aggregation & parsing
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.js              # JWT verification
│   │   │   ├── validation.js        # Input validation
│   │   │   ├── rateLimit.js         # API rate limiting
│   │   │   └── errorHandler.js      # Global error handling
│   │   │
│   │   ├── utils/
│   │   │   ├── calculations.js      # Financial metrics (Sharpe, Sortino, etc)
│   │   │   ├── cryptoUtils.js       # SHA-256 hashing
│   │   │   ├── formatters.js        # Data formatting
│   │   │   └── constants.js         # Game constants
│   │   │
│   │   └── app.js                   # Express app entry point
│   │
│   └── tests/
│       ├── services/
│       ├── routes/
│       └── utils/
│
├── 🎨 FRONTEND (React + Vite + Tailwind)
│   ├── src/
│   │   │
│   │   ├── 📍 PAGES (Main Views)
│   │   │   ├── pages/
│   │   │   │   ├── LandingPage.jsx       # Welcome & login
│   │   │   │   ├── OnboardingPage.jsx    # Avatar creation & KYC questionnaire
│   │   │   │   ├── MainMapPage.jsx       # Main game world (interactive map)
│   │   │   │   ├── ProfilePage.jsx       # Player profile & stats
│   │   │   │   ├── LeaderboardPage.jsx   # Rankings & comparisons
│   │   │   │   ├── ResultsPage.jsx       # Session end results
│   │   │   │   └── TutorialPage.jsx      # Learning mode
│   │   │
│   │   ├── 🗺️ MAP & LOCATIONS (Interactive World)
│   │   │   ├── components/Map/
│   │   │   │   ├── GameMap.jsx           # Main interactive map
│   │   │   │   ├── MapLocation.jsx       # Individual location component
│   │   │   │   ├── AvatarDisplay.jsx     # Player avatar on map
│   │   │   │   └── LocationConnector.jsx # Path/connection between zones
│   │   │   │
│   │   │   ├── locations/                # Location definitions & logic
│   │   │   │   ├── CryptoMarket.jsx      # Crypto zone
│   │   │   │   ├── StockExchange.jsx     # Stocks zone
│   │   │   │   ├── BondMarket.jsx        # Bonds zone
│   │   │   │   ├── CommodityHub.jsx      # Commodities zone
│   │   │   │   ├── NewsCenter.jsx        # News & media zone
│   │   │   │   ├── SecurityHub.jsx       # Cybersecurity zone
│   │   │   │   ├── AIHub.jsx             # AI advisor central
│   │   │   │   ├── PodcastStudio.jsx     # Podcast generation zone
│   │   │   │   ├── TradingFloor.jsx      # Active trades zone
│   │   │   │   └── LeaderboardHall.jsx   # Rankings hall
│   │   │
│   │   ├── 🧑 AVATAR & CHARACTER
│   │   │   ├── components/Avatar/
│   │   │   │   ├── AvatarCreator.jsx     # Avatar customization
│   │   │   │   ├── AvatarStats.jsx       # Health, mood, reputation
│   │   │   │   ├── AvatarInventory.jsx   # Items, achievements
│   │   │   │   └── WalletDisplay.jsx     # Wallet visualization
│   │   │
│   │   ├── 💼 PORTFOLIO & TRADING
│   │   │   ├── components/Portfolio/
│   │   │   │   ├── PortfolioOverview.jsx # Holdings summary
│   │   │   │   ├── AssetDetail.jsx       # Individual asset page
│   │   │   │   ├── TradeModal.jsx        # Buy/sell interface
│   │   │   │   ├── TransactionHistory.jsx
│   │   │   │   ├── PerformanceChart.jsx
│   │   │   │   └── RiskIndicators.jsx
│   │   │
│   │   ├── 📊 MARKET & ASSETS
│   │   │   ├── components/Market/
│   │   │   │   ├── CryptoBoard.jsx       # Crypto prices & charts
│   │   │   │   ├── StockBoard.jsx        # Stock prices & charts
│   │   │   │   ├── IndexBoard.jsx        # Market indices
│   │   │   │   ├── BondBoard.jsx         # Bond yields
│   │   │   │   ├── CommodityBoard.jsx    # Commodity prices
│   │   │   │   ├── PriceChart.jsx        # Recharts integration
│   │   │   │   ├── TechnicalIndicators.jsx
│   │   │   │   └── MarketSentiment.jsx   # Bullish/Bearish indicators
│   │   │
│   │   ├── 🤖 AI ADVISOR
│   │   │   ├── components/AI/
│   │   │   │   ├── AdvisorPanel.jsx      # AI assistant sidebar
│   │   │   │   ├── RiskProfiler.jsx      # Initial questionnaire
│   │   │   │   ├── Recommendations.jsx   # Trade suggestions
│   │   │   │   ├── ChatbotMentor.jsx     # Interactive chat
│   │   │   │   ├── PersonalizedInsights.jsx
│   │   │   │   ├── MarketSentimentAnalysis.jsx
│   │   │   │   └── AdvisorAvatar.jsx     # AI character representation
│   │   │
│   │   ├── 📰 NEWS & SENTIMENT
│   │   │   ├── components/News/
│   │   │   │   ├── NewsCenter.jsx        # Main news feed
│   │   │   │   ├── NewsCard.jsx          # Individual news item
│   │   │   │   ├── NewsSummarizer.jsx    # AI summaries
│   │   │   │   ├── PodcastPlayer.jsx     # Play AI-generated podcasts
│   │   │   │   ├── SentimentBadge.jsx    # Sentiment indicator
│   │   │   │   ├── TweetFeed.jsx         # Real tweets integration
│   │   │   │   ├── ArticleAnalysis.jsx   # Deep analysis with LLM
│   │   │   │   └── NewsFilter.jsx        # Filter by category/source
│   │   │
│   │   ├── 🛡️ CYBERSECURITY
│   │   │   ├── components/Security/
│   │   │   │   ├── ThreatAlert.jsx       # Threat notifications
│   │   │   │   ├── ThreatResponsePanel.jsx
│   │   │   │   ├── SecurityStatus.jsx    # Security score visualization
│   │   │   │   ├── TwoFASetup.jsx        # 2FA activation
│   │   │   │   ├── WalletSecurity.jsx    # Wallet security settings
│   │   │   │   ├── IncidentReport.jsx    # Threat history
│   │   │   │   └── SecurityTutorial.jsx  # Learning center
│   │   │
│   │   ├── 🎯 GAMIFICATION
│   │   │   ├── components/Gamification/
│   │   │   │   ├── MissionTracker.jsx    # Active missions
│   │   │   │   ├── Achievements.jsx      # Badges display
│   │   │   │   ├── ReputationSystem.jsx  # Trust score
│   │   │   │   ├── RewardsPanel.jsx      # Points & rewards
│   │   │   │   ├── Leaderboard.jsx       # Rankings
│   │   │   │   ├── StreakIndicator.jsx   # Win streak
│   │   │   │   └── AchievementPopup.jsx  # Unlock notifications
│   │   │
│   │   ├── 🔗 BLOCKCHAIN
│   │   │   ├── components/Blockchain/
│   │   │   │   ├── TransactionLedger.jsx # Immutable history
│   │   │   │   ├── BlockchainViewer.jsx  # Visual chain
│   │   │   │   └── TransactionProof.jsx  # Verification
│   │   │
│   │   ├── 🎮 COMMON COMPONENTS
│   │   │   ├── components/Common/
│   │   │   │   ├── Navigation.jsx        # Top navigation
│   │   │   │   ├── Sidebar.jsx           # Left sidebar with quick access
│   │   │   │   ├── NotificationCenter.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Tooltip.jsx
│   │   │   │   └── Toast.jsx
│   │   │
│   │   ├── 🎨 CONTEXTS
│   │   │   ├── context/
│   │   │   │   ├── GameContext.js        # Global game state
│   │   │   │   ├── UserContext.js        # User/Avatar state
│   │   │   │   ├── NotificationContext.js
│   │   │   │   ├── MarketContext.js      # Real-time prices
│   │   │   │   └── AIContext.js          # AI state & chat
│   │   │
│   │   ├── 🪝 CUSTOM HOOKS
│   │   │   ├── hooks/
│   │   │   │   ├── usePortfolio.js       # Portfolio management
│   │   │   │   ├── useMarket.js          # Market data & updates
│   │   │   │   ├── useAI.js              # AI recommendations
│   │   │   │   ├── useSecurity.js        # Threat management
│   │   │   │   ├── useNews.js            # News feed management
│   │   │   │   ├── useGameState.js       # Overall game logic
│   │   │   │   ├── useLeaderboard.js     # Rankings sync
│   │   │   │   ├── useChatbot.js         # Chatbot state
│   │   │   │   └── useWebSocket.js       # Real-time updates
│   │   │
│   │   ├── 🛠️ UTILS
│   │   │   ├── utils/
│   │   │   │   ├── api.js                # API client configuration
│   │   │   │   ├── calculations.js       # Financial math
│   │   │   │   ├── formatters.js         # Display formatting
│   │   │   │   ├── validators.js         # Input validation
│   │   │   │   ├── constants.js          # Game constants
│   │   │   │   ├── audioUtils.js         # Podcast playback
│   │   │   │   └── storageUtils.js       # Local storage helpers
│   │   │
│   │   ├── 📊 SERVICES
│   │   │   ├── services/
│   │   │   │   ├── apiService.js         # API calls
│   │   │   │   ├── marketService.js      # Market data
│   │   │   │   ├── aiService.js          # AI integration
│   │   │   │   ├── newsService.js        # News aggregation
│   │   │   │   ├── authService.js        # Authentication
│   │   │   │   ├── wsService.js          # WebSocket manager
│   │   │   │   └── cachingService.js     # Data caching
│   │   │
│   │   ├── 🎨 STYLES
│   │   │   ├── styles/
│   │   │   │   ├── global.css            # Global styles
│   │   │   │   ├── map.css               # Map styling
│   │   │   │   ├── animations.css        # Keyframe animations
│   │   │   │   ├── themes.css            # Dark/Light themes
│   │   │   │   └── responsive.css        # Mobile optimization
│   │   │
│   │   ├── 📁 DATA
│   │   │   ├── data/
│   │   │   │   ├── assets.json           # Asset definitions
│   │   │   │   ├── locations.json        # Map locations
│   │   │   │   ├── missions.json         # Mission definitions
│   │   │   │   ├── achievements.json     # Achievement definitions
│   │   │   │   ├── threats.json          # Cyber threat database
│   │   │   │   └── riskProfiles.json     # Risk profile templates
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   │   ├── assets/
│   │   │   ├── avatars/                  # Avatar skins & customizations
│   │   │   ├── locations/                # Location background images
│   │   │   ├── characters/               # AI mentor characters
│   │   │   ├── sounds/                   # Game sounds & effects
│   │   │   ├── music/                    # Background music
│   │   │   └── icons/                    # Game icons
│   │   └── index.html
│   │
│   └── vite.config.js
│
├── 📚 DOCUMENTATION
│   ├── docs/
│   │   ├── ARCHITECTURE.md               # System design
│   │   ├── API_REFERENCE.md              # API documentation
│   │   ├── GAMEPLAY.md                   # Mechanics & features
│   │   ├── AI_SYSTEM.md                  # AI architecture
│   │   ├── SECURITY.md                   # Cybersecurity features
│   │   ├── BLOCKCHAIN.md                 # Blockchain implementation
│   │   ├── NEWS_ANALYSIS.md              # News & NLP system
│   │   ├── DEPLOYMENT.md                 # Production guide
│   │   ├── CONTRIBUTING.md               # Developer guide
│   │   └── QUICKSTART.md                 # Getting started
│   │
│   └── README.md
│
├── ⚙️ CONFIGURATION
│   ├── .env.example
│   ├── .gitignore
│   ├── docker-compose.yml                # Docker setup
│   ├── .eslintrc.js
│   ├── .prettierrc
│   └── package.json
│
└── 🧪 TESTING
    ├── __tests__/
    │   ├── unit/
    │   ├── integration/
    │   └── e2e/
    └── test-config.js
```

---

## 🎮 GAMEPLAY FLOW

### Phase 1: ONBOARDING
```
Landing Page
    ↓
User Registration (KYC Questionnaire)
    ↓
Risk Profile Assessment (Questions)
    ↓
Avatar Creation (Customization)
    ↓
Wallet Setup & Starting Capital ($100k)
    ↓
Tutorial Mode (Optional)
    ↓
Main Game World
```

### Phase 2: MAIN GAME WORLD
```
Interactive Map with 10 Locations:
├── 🪙 Crypto Market         → BTC, ETH, ALT coins
├── 📈 Stock Exchange        → AAPL, MSFT, GOOGL, etc
├── 🏦 Bond Market           → Government & corporate bonds
├── 🛢️ Commodity Hub         → Gold, Oil, Gas, Agricultural
├── 📰 News Center           → Tweets, Articles, Analysis
├── 🎙️ Podcast Studio        → AI-generated podcasts
├── 🛡️ Security Hub          → Threat management, 2FA
├── 🤖 AI Hub                → Advisor recommendations
├── 💼 Trading Floor         → Active trades & orders
└── 🏆 Leaderboard Hall      → Rankings & competitions
```

### Phase 3: CORE LOOPS
```
MINUTE-BY-MINUTE:
- Market prices update (realistic simulation)
- AI advisor generates suggestions
- News feed refreshes
- Threats may trigger

HOURLY:
- Technical indicators recalculate
- Portfolio performance updates
- New missions may appear
- Leaderboard updates

DAILY:
- Weekly challenges
- Achievement unlocks
- Reward distributions
- Seasonal events
```

---

## 🧠 CORE FEATURES

### 1️⃣ AVATAR & CHARACTER SYSTEM
```javascript
Avatar Features:
├── Customization
│   ├── Appearance (skin, outfit, accessories)
│   ├── Name & backstory
│   └── Special abilities (based on profile)
│
├── Stats Display
│   ├── Portfolio Value
│   ├── Reputation Score (0-100)
│   ├── Security Level (0-100)
│   ├── Experience Points
│   └── Win Streak
│
├── Wallet Visualization
│   ├── Real-time balance
│   ├── Currency distribution
│   ├── Transaction speed indicator
│   └── Security status badge
│
└── Profile Card
    ├── Risk profile badge
    ├── Total trades executed
    ├── Achievements unlocked
    └── Joined date & playtime
```

### 2️⃣ INTERACTIVE MAP SYSTEM
```javascript
Map Architecture:
├── Hexagonal/Grid-based layout
├── Zoom in/out capability
├── Click to navigate zones
├── Real-time avatar position
├── NPC AI mentors at each location
├── Visual effects & animations
└── Responsive to gameplay events

Location Types:
├── Market Zones (Buy/Sell assets)
├── Information Zones (News, analysis)
├── Security Zones (Threat management)
├── Social Zones (Leaderboards, chat)
└── Special Event Zones (Temporary)
```

### 3️⃣ MULTI-ASSET PORTFOLIO
```javascript
Supported Assets:
├── Cryptocurrencies
│   ├── BTC, ETH, BNB, XRP, ADA, SOL
│   └── 20+ altcoins
│
├── Stocks
│   ├── Tech: AAPL, MSFT, GOOGL, NVDA
│   ├── Finance: JPM, BAC, GS, WFC
│   ├── Healthcare: JNJ, UNH, PFE
│   └── Consumer: AMZN, WMT, NKE
│
├── Indices
│   ├── S&P 500 (SPY)
│   ├── NASDAQ (QQQ)
│   ├── Dow Jones (DIA)
│   └── International indices
│
├── Bonds
│   ├── US Treasury yields
│   ├── Corporate bonds
│   ├── Bond ETFs
│   └── High-yield bonds
│
├── Commodities
│   ├── Gold (GLD)
│   ├── Oil (USO)
│   ├── Natural Gas (UNG)
│   └── Agricultural (CORN, WHEAT)
│
└── Funds
    ├── ETFs
    ├── Mutual funds
    ├── Index funds
    └── Sector-specific funds
```

### 4️⃣ AI ADVISOR SYSTEM
```javascript
AI Features:
├── Risk Profiler (Initial questionnaire)
│   └── Outputs: Conservative / Balanced / Aggressive
│
├── Personalized Recommendations
│   ├── Buy signals based on technical analysis
│   ├── Sell recommendations for profit-taking
│   ├── Rebalancing suggestions
│   ├── Diversification alerts
│   └── Risk management tips
│
├── Market Sentiment Analysis
│   ├── Bullish/Bearish/Neutral indicators
│   ├── Volatility warnings
│   ├── Trend identification
│   └── Support/Resistance levels
│
├── Chatbot Mentor
│   ├── Natural language Q&A
│   ├── Educational responses
│   ├── Interactive learning
│   ├── Context-aware suggestions
│   └── Personality-driven responses
│
├── Portfolio Analytics
│   ├── Sharpe Ratio calculation
│   ├── Sortino Ratio analysis
│   ├── Maximum Drawdown
│   ├── Value at Risk (VaR)
│   └── Beta & correlation analysis
│
└── Reinforcement Learning
    ├── Learns from past decisions
    ├── Adapts recommendations over time
    ├── Records user behavior patterns
    └── Improves accuracy with usage
```

### 5️⃣ NEWS & SENTIMENT SYSTEM
```javascript
News Features:
├── Multi-Source Feed
│   ├── Real news from APIs (NewsAPI, AlphaVantage)
│   ├── Social media feeds (Twitter integration)
│   ├── RSS feeds from financial sites
│   ├── Generated news events (game events)
│   └── Curated by relevance to portfolio
│
├── AI-Powered Analysis
│   ├── Automatic summarization (LLM)
│   │   └── 2-3 sentence summaries
│   │
│   ├── Sentiment Analysis
│   │   ├── Positive / Negative / Neutral
│   │   ├── Confidence scores
│   │   └── Market impact prediction
│   │
│   ├── Impact Rating
│   │   ├── High / Medium / Low impact
│   │   └── Affected assets
│   │
│   └── Key Takeaways
│       └── Bullet points for quick reading
│
├── Podcast Generation
│   ├── Convert articles to audio (Google Notebook LLM)
│   ├── AI voice narration
│   ├── Adjustable playback speed
│   ├── Download for offline listening
│   └── Transcript available
│
├── Advanced Analysis
│   ├── Deep dive into trending topics
│   ├── Multiple article comparison
│   ├── Contrarian views
│   └── Expert commentary
│
└── Filters & Customization
    ├── By asset class
    ├── By sentiment
    ├── By impact level
    ├── By source type
    └── Saved articles (bookmarks)
```

### 6️⃣ CYBERSECURITY SYSTEM
```javascript
Security Features:
├── Threat Types
│   ├── 🎣 Phishing Attacks
│   │   └── Fake login prompts, emails
│   │
│   ├── 🚨 Hacking Attempts
│   │   └── Unauthorized access attempts
│   │
│   ├── 💳 Fraud Detection
│   │   └── Suspicious transactions
│   │
│   ├── 🦠 Malware Alerts
│   │   └── Infected device warnings
│   │
│   ├── ⚠️ Exchange Breaches
│   │   └── Third-party security incidents
│   │
│   ├── 🔍 Anomaly Detection
│   │   └── Unusual account activity
│   │
│   └── 📉 Volatility Spike
│       └── Flash crash simulations
│
├── Defense Mechanisms
│   ├── 2FA Activation
│   │   ├── Prevents hacking (40% damage reduction)
│   │   └── Blocks unauthorized trades
│   │
│   ├── Verification Steps
│   │   ├── Email confirmation
│   │   ├── Identity verification
│   │   └── Transaction approval
│   │
│   ├── Wallet Security
│   │   ├── Cold storage simulation
│   │   ├── Multi-sig options
│   │   └── Backup phrases
│   │
│   ├── Transaction Monitoring
│   │   ├── Real-time alerts
│   │   ├── Anomaly scoring
│   │   └── Auto-blocking triggers
│   │
│   └── Incident Response
│       ├── Quick action options
│       ├── Damage mitigation
│       ├── Recovery procedures
│       └── Report generation
│
├── Security Score
│   ├── 0-100 scale
│   ├── Impacts AI recommendations
│   ├── Affects mission availability
│   ├── Influences leaderboard ranking
│   └── Unlocks security achievements
│
└── Blockchain Ledger
    ├── Immutable transaction record
    ├── SHA-256 hashing
    ├── Cryptographic verification
    ├── Tamper-proof history
    └── Audit trail
```

### 7️⃣ GAMIFICATION SYSTEM
```javascript
Gamification Features:
├── Missions & Quests
│   ├── Daily missions (20 points each)
│   ├── Weekly challenges (100 points each)
│   ├── Monthly events (500 points each)
│   ├── Special limited-time events
│   └── Achievement-based missions
│
├── Achievements & Badges
│   ├── 🚀 First Trade
│   ├── 📊 Diversifier (5+ assets)
│   ├── 🔒 Cyber-Safe (no breaches)
│   ├── 💰 Profit Master (+$10k)
│   ├── 🛡️ Survivor (3+ threats resisted)
│   ├── ⚖️ Balanced (perfect allocation)
│   ├── 🤖 AI Follower (5+ recommendations)
│   ├── 💎 Millionaire ($1M portfolio)
│   ├── 🏆 Leaderboard Champion (Top 10)
│   ├── 📈 Bull Rider (consecutive gains)
│   ├── 🦅 Risk Manager (high security)
│   └── 🌟 Legendary Trader (all achievements)
│
├── Reputation System
│   ├── Trust Score (0-100)
│   ├── Increases with:
│   │   ├── Successful trades
│   │   ├── Security practices
│   │   ├── Mission completion
│   │   └── Leaderboard ranking
│   └── Affects:
│       ├── Access to special events
│       ├── Loan/margin availability
│       ├── VIP features
│       └── Exclusive rewards
│
├── Rewards System
│   ├── Experience Points (XP)
│   │   └── Levels up avatar
│   │
│   ├── In-game Currency
│   │   ├── Earned from missions
│   │   ├── Spent on customizations
│   │   └── Redeemable for real perks
│   │
│   ├── Cosmetics
│   │   ├── Avatar skins
│   │   ├── Wallet designs
│   │   ├── UI themes
│   │   └── Special effects
│   │
│   ├── Boosters & Power-ups
│   │   ├── 2x profit multiplier (24hr)
│   │   ├── Risk reduction (12hr)
│   │   ├── Market insider info
│   │   └── Threat immunity
│   │
│   └── Exclusive Features
│       ├── Early access to new assets
│       ├── Premium AI recommendations
│       ├── Advanced analytics tools
│       └── Private tournament access
│
├── Leaderboards
│   ├── Global Rankings
│   │   ├── By profit percentage
│   │   ├── By Sharpe ratio
│   │   ├── By security score
│   │   ├── By XP gained
│   │   └── By consecutive wins
│   │
│   ├── Category Leaderboards
│   │   ├── Crypto specialists
│   │   ├── Stock traders
│   │   ├── Options traders
│   │   ├── Long-term investors
│   │   └── Risk managers
│   │
