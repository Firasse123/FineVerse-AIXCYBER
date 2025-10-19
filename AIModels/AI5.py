import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import re

class CryptoNewsScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.crypto_keywords = [
            'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency',
            'blockchain', 'altcoin', 'defi', 'nft', 'web3', 'token', 'coin'
        ]
    
    def scrape_cointelegraph(self):
        """Scrape cryptocurrency news from Cointelegraph"""
        url = "https://cointelegraph.com/news"
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            articles = []
            news_items = soup.find_all('article', class_='post-card-inline')
            
            for item in news_items[:10]:  # Get top 10 articles
                try:
                    title_elem = item.find('span', class_='post-card-inline__title')
                    link_elem = item.find('a', class_='post-card-inline__figure-link')
                    
                    if title_elem and link_elem:
                        article = {
                            'title': title_elem.text.strip(),
                            'url': 'https://cointelegraph.com' + link_elem['href'],
                            'source': 'Cointelegraph',
                            'scraped_at': datetime.now().isoformat()
                        }
                        articles.append(article)
                except Exception as e:
                    continue
            
            return articles
        except Exception as e:
            print(f"Error scraping Cointelegraph: {e}")
            return []
    
    def scrape_generic_site(self, url):
        """Scrape any website and filter for cryptocurrency-related news"""
        try:
            response = requests.get(url, headers=self.headers, timeout=10)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            articles = []
            
            # Find all article/heading tags
            headings = soup.find_all(['h1', 'h2', 'h3', 'article'])
            
            for heading in headings:
                text = heading.get_text().strip()
                links = heading.find_all('a', href=True)
                
                # Check if text contains crypto keywords
                if self.is_crypto_related(text):
                    link = links[0]['href'] if links else None
                    
                    # Make relative URLs absolute
                    if link and not link.startswith('http'):
                        from urllib.parse import urljoin
                        link = urljoin(url, link)
                    
                    article = {
                        'title': text[:200],  # Limit title length
                        'url': link,
                        'source': url,
                        'scraped_at': datetime.now().isoformat()
                    }
                    articles.append(article)
            
            # Remove duplicates based on title
            seen = set()
            unique_articles = []
            for article in articles:
                if article['title'] not in seen:
                    seen.add(article['title'])
                    unique_articles.append(article)
            
            return unique_articles[:15]  # Return top 15
            
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return []
    
    def is_crypto_related(self, text):
        """Check if text contains cryptocurrency-related keywords"""
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in self.crypto_keywords)
    
    def save_to_json(self, articles, filename='crypto_news.json'):
        """Save scraped articles to JSON file"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(articles, f, indent=2, ensure_ascii=False)
        print(f"Saved {len(articles)} articles to {filename}")
    
    def display_articles(self, articles):
        """Display articles in a readable format"""
        print(f"\n{'='*80}")
        print(f"Found {len(articles)} cryptocurrency news articles")
        print(f"{'='*80}\n")
        
        for i, article in enumerate(articles, 1):
            print(f"{i}. {article['title']}")
            print(f"   Source: {article['source']}")
            if article.get('url'):
                print(f"   URL: {article['url']}")
            print()

# Example usage
if __name__ == "__main__":
    scraper = CryptoNewsScraper()
    
    print("Cryptocurrency News Scraper")
    print("="*80)
    print("\nOptions:")
    print("1. Scrape from Cointelegraph")
    print("2. Scrape from custom URL (filters crypto news)")
    print("3. Scrape multiple sites")
    
    choice = input("\nEnter your choice (1-3): ")
    
    all_articles = []
    
    if choice == "1":
        print("\nScraping Cointelegraph...")
        all_articles = scraper.scrape_cointelegraph()
    
    elif choice == "2":
        url = input("Enter website URL: ")
        print(f"\nScraping {url}...")
        all_articles = scraper.scrape_generic_site(url)
    
    elif choice == "3":
        # Example: scrape multiple crypto news sites
        sites = [
            "https://cointelegraph.com/news",
            "https://decrypt.co",
            "https://cryptonews.com"
        ]
        for site in sites:
            print(f"\nScraping {site}...")
            articles = scraper.scrape_generic_site(site)
            all_articles.extend(articles)
    
    # Display and save results
    if all_articles:
        scraper.display_articles(all_articles)
        scraper.save_to_json(all_articles)
    else:
        print("No articles found or error occurred.")