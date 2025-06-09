import requests
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import time

# Load environment variables from .env file
load_dotenv()

# Configuration
NEWS_API_KEY = os.getenv("NEWS_API_KEY")
BASE_URL = "https://newsapi.org/v2"
DEFAULT_TIMEOUT = 15
DEFAULT_PAGE_SIZE = 50
MAX_RETRIES = 2
RETRY_DELAY = 1  # seconds

# Politics keywords for better search results
POLITICS_KEYWORDS = [
    "politics", "government", "election", "congress", "senate", 
    "president", "political", "Biden", "Trump", "Congress", 
    "Senate", "election", "government", "policy", "vote"
]

def log_debug(message):
    """Simple debug logging with timestamp"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[NEWS-API {timestamp}] {message}")

def validate_date_format(date_string):
    """Check if date string is in correct format (YYYY-MM-DD)"""
    try:
        datetime.strptime(date_string, "%Y-%m-%d")
        return True
    except (ValueError, TypeError):
        return False

def get_default_date_range():
    """Get default date range (last 3 days) for news queries"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=3)
    return start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")

def should_use_everything_endpoint(category, query, from_date, to_date):
    """Determine which NewsAPI endpoint to use based on parameters"""
    # Use /everything for:
    # 1. Politics category (better results)
    # 2. Date range queries
    # 3. Search queries without specific category
    return (
        category == "politics" or
        (from_date and to_date) or
        (query and not category)
    )

def build_politics_query():
    """Build optimized search query for politics news"""
    return " OR ".join(POLITICS_KEYWORDS)

def filter_valid_articles(articles):
    """Remove articles with missing or removed content"""
    if not articles:
        return []
    
    valid_articles = []
    for article in articles:
        # Check if article has required fields and isn't removed
        if (article and 
            article.get('title') and 
            article.get('title') != '[Removed]' and
            article.get('description') and 
            article.get('description') != '[Removed]' and
            article.get('url') and
            article.get('source')):
            
            # Additional quality checks
            title_length = len(article.get('title', ''))
            desc_length = len(article.get('description', ''))
            
            # Skip articles with very short titles or descriptions
            if title_length > 10 and desc_length > 20:
                valid_articles.append(article)
    
    return valid_articles

def make_api_request(url, params, retries=0):
    """Make API request with retry logic"""
    try:
        log_debug(f"Making request to: {url}")
        log_debug(f"Parameters: {params}")
        
        response = requests.get(url, params=params, timeout=DEFAULT_TIMEOUT)
        return response
        
    except requests.exceptions.Timeout:
        if retries < MAX_RETRIES:
            log_debug(f"Request timeout, retrying in {RETRY_DELAY}s... (attempt {retries + 1})")
            time.sleep(RETRY_DELAY)
            return make_api_request(url, params, retries + 1)
        raise
        
    except requests.exceptions.ConnectionError:
        if retries < MAX_RETRIES:
            log_debug(f"Connection error, retrying in {RETRY_DELAY}s... (attempt {retries + 1})")
            time.sleep(RETRY_DELAY)
            return make_api_request(url, params, retries + 1)
        raise

def fetch_news(category="", q="", language="en", from_date=None, to_date=None, page_size=None):
    """
    Fetch news articles from NewsAPI
    
    Args:
        category (str): News category (business, entertainment, etc.)
        q (str): Search query/keywords
        language (str): Language code (en, es, fr, etc.)
        from_date (str): Start date in YYYY-MM-DD format
        to_date (str): End date in YYYY-MM-DD format
        page_size (int): Number of articles to fetch (max 100)
    
    Returns:
        dict: API response with articles and metadata
    """
    
    # Check if API key is configured
    if not NEWS_API_KEY:
        log_debug(" NEWS_API_KEY not configured")
        return {
            "error": "News API key not configured. Please add NEWS_API_KEY to your .env file", 
            "articles": [],
            "status": "configuration_error",
            "help": "Get your free API key from https://newsapi.org/"
        }
    
    try:
        # Set default page size
        if not page_size:
            page_size = DEFAULT_PAGE_SIZE
        
        # Validate page size
        page_size = min(max(1, page_size), 100)  # Ensure between 1-100
        
        # Validate date formats if provided
        if from_date and not validate_date_format(from_date):
            log_debug(f"Invalid from_date format: {from_date}")
            return {
                "error": "Invalid date format. Use YYYY-MM-DD format",
                "articles": [],
                "status": "validation_error"
            }
            
        if to_date and not validate_date_format(to_date):
            log_debug(f"Invalid to_date format: {to_date}")
            return {
                "error": "Invalid date format. Use YYYY-MM-DD format",
                "articles": [],
                "status": "validation_error"
            }
        
        # Determine which endpoint to use
        use_everything = should_use_everything_endpoint(category, q, from_date, to_date)
        
        if use_everything:
            # Use /everything endpoint for more flexible searches
            url = f"{BASE_URL}/everything"
            params = {
                "apiKey": NEWS_API_KEY,
                "language": language,
                "pageSize": page_size,
                "sortBy": "publishedAt"
            }
            
            # Build search query
            if category == "politics":
                params["q"] = build_politics_query()
                log_debug("Using politics-specific search query")
            elif q:
                params["q"] = q
                log_debug(f"Using custom search query: {q}")
            else:
                params["q"] = "latest news"
                log_debug("Using default search query")
            
            # Handle date range
            if from_date and to_date:
                params["from"] = from_date
                params["to"] = to_date
                log_debug(f"Using custom date range: {from_date} to {to_date}")
            else:
                # Use default date range for fresher content
                default_from, default_to = get_default_date_range()
                params["from"] = default_from
                params["to"] = default_to
                log_debug(f"Using default date range: {default_from} to {default_to}")
                
        else:
            # Use /top-headlines for standard categories
            url = f"{BASE_URL}/top-headlines"
            params = {
                "apiKey": NEWS_API_KEY,
                "language": language,
                "pageSize": page_size,
                "country": "us"  # Default to US news
            }
            
            if category:
                params["category"] = category
                log_debug(f"Using category: {category}")
            
            if q:
                params["q"] = q
                # Remove country restriction when using search query
                params.pop("country", None)
                log_debug(f"Using search query: {q} (removed country filter)")

        # Clean parameters (remove empty values)
        params = {k: v for k, v in params.items() if v is not None and v != ""}
        
        # Make API request
        response = make_api_request(url, params)
        
        log_debug(f"Response status: {response.status_code}")
        
        # Handle successful response
        if response.status_code == 200:
            data = response.json()
            raw_articles = data.get('articles', [])
            
            # Filter articles for quality
            filtered_articles = filter_valid_articles(raw_articles)
            
            log_debug(f" Fetched {len(filtered_articles)} valid articles (filtered from {len(raw_articles)} total)")
            
            return {
                "status": "ok",
                "totalResults": len(filtered_articles),
                "articles": filtered_articles,
                "metadata": {
                    "source_endpoint": "everything" if use_everything else "top-headlines",
                    "raw_count": len(raw_articles),
                    "filtered_count": len(filtered_articles),
                    "language": language,
                    "category": category if category else "all",
                    "fetch_time": datetime.now().isoformat()
                }
            }
            
        # Handle rate limiting
        elif response.status_code == 429:
            log_debug(" Rate limit exceeded")
            return {
                "error": "Rate limit exceeded. Please try again later.",
                "articles": [],
                "status": "rate_limited",
                "retry_after": response.headers.get("Retry-After", "unknown")
            }
            
        # Handle authentication errors
        elif response.status_code == 401:
            log_debug(" Invalid API key")
            return {
                "error": "Invalid API key. Please check your NEWS_API_KEY.",
                "articles": [],
                "status": "unauthorized",
                "help": "Verify your API key at https://newsapi.org/account"
            }
            
        # Handle other API errors
        else:
            log_debug(f" API error: {response.status_code}")
            try:
                error_data = response.json()
                error_message = error_data.get('message', f'HTTP {response.status_code} error')
            except:
                error_message = f'HTTP {response.status_code} error'
            
            return {
                "error": f"API error: {error_message}",
                "status_code": response.status_code,
                "articles": [],
                "status": "api_error"
            }

    except requests.exceptions.Timeout:
        log_debug(" Request timeout after retries")
        return {
            "error": "Request timeout. Please try again later.",
            "articles": [],
            "status": "timeout"
        }
        
    except requests.exceptions.ConnectionError:
        log_debug(" Connection error after retries")
        return {
            "error": "Connection error. Please check your internet connection.",
            "articles": [],
            "status": "connection_error"
        }
        
    except requests.exceptions.RequestException as e:
        log_debug(f" Network error: {str(e)}")
        return {
            "error": f"Network error: {str(e)}",
            "articles": [],
            "status": "network_error"
        }
        
    except Exception as e:
        log_debug(f" Unexpected error: {str(e)}")
        return {
            "error": f"Unexpected error: {str(e)}",
            "articles": [],
            "status": "unexpected_error"
        }

def get_news_categories():
    """Get list of available news categories"""
    return [
        "business", "entertainment", "general", "health", 
        "science", "sports", "technology", "politics"
    ]

def get_supported_languages():
    """Get list of supported language codes"""
    return {
        "en": "English",
        "es": "Spanish", 
        "fr": "French",
        "de": "German",
        "it": "Italian",
        "pt": "Portuguese",
        "ru": "Russian",
        "zh": "Chinese"
    }

def test_api_connection():
    """Test the NewsAPI connection with detailed diagnostics"""
    print(" Testing NewsAPI connection...")
    print("-" * 40)
    
    # Test 1: Check API key
    if not NEWS_API_KEY:
        print(" Test 1 FAILED: NEWS_API_KEY not found")
        print("   Please add NEWS_API_KEY to your .env file")
        return False
    else:
        print(" Test 1 PASSED: API key found")
    
    # Test 2: Simple news fetch
    print(" Test 2: Fetching technology news...")
    result = fetch_news(category="technology", page_size=5)
    
    if result.get("error"):
        print(f" Test 2 FAILED: {result['error']}")
        if result.get("help"):
            print(f"   Help: {result['help']}")
        return False
    else:
        article_count = len(result.get("articles", []))
        print(f" Test 2 PASSED: {article_count} articles retrieved")
    
    # Test 3: Search query test
    print(" Test 3: Testing search functionality...")
    search_result = fetch_news(q="artificial intelligence", page_size=3)
    
    if search_result.get("error"):
        print(f" Test 3 FAILED: {search_result['error']}")
        return False
    else:
        search_count = len(search_result.get("articles", []))
        print(f" Test 3 PASSED: {search_count} search results found")
    
    print("-" * 40)
    print(" All tests passed! NewsAPI is working correctly.")
    
    # Show some sample data
    if result.get("articles"):
        print("\n📰 Sample article:")
        sample = result["articles"][0]
        print(f"   Title: {sample.get('title', 'N/A')[:60]}...")
        print(f"   Source: {sample.get('source', {}).get('name', 'N/A')}")
        print(f"   Published: {sample.get('publishedAt', 'N/A')}")
    
    return True

def get_api_status():
    """Get detailed API status information"""
    return {
        "api_key_configured": bool(NEWS_API_KEY),
        "base_url": BASE_URL,
        "default_timeout": DEFAULT_TIMEOUT,
        "max_retries": MAX_RETRIES,
        "supported_categories": get_news_categories(),
        "supported_languages": list(get_supported_languages().keys()),
        "version": "1.1.0"
    }

# Main execution for testing
if __name__ == "__main__":
    print("NewsAPI Module - Enhanced Version 1.1.0")
    print("=" * 50)
    
    # Show API status
    status = get_api_status()
    print(f" API Configuration:")
    print(f"   API Key: {' Configured' if status['api_key_configured'] else ' Missing'}")
    print(f"   Base URL: {status['base_url']}")
    print(f"   Categories: {len(status['supported_categories'])} available")
    print(f"   Languages: {len(status['supported_languages'])} supported")
    print()
    
    # Run tests
    test_api_connection()