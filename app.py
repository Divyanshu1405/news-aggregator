from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from newsapi import fetch_news
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)  

# Configuration
DEBUG_MODE = True
ALLOWED_FILE_EXTENSIONS = ['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.svg']
VALID_NEWS_CATEGORIES = ["", "business", "entertainment", "general", "health", "science", "sports", "technology", "politics"]

# Helper function to log messages with timestamp
def log_message(message):
    """Simple logging function for debugging"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {message}")

# Helper function to validate file extensions
def is_allowed_file(filename):
    """Check if file extension is allowed for security"""
    return any(filename.lower().endswith(ext) for ext in ALLOWED_FILE_EXTENSIONS)

# Helper function to clean articles
def clean_articles(articles):
    """Remove articles with missing or removed content"""
    cleaned = []
    for article in articles:
        if article and article.get('title') and article.get('title') != '[Removed]':
            # Also check for other common removed indicators
            if article.get('description') != '[Removed]' and article.get('content') != '[Removed]':
                cleaned.append(article)
    return cleaned

# Frontend Routes
@app.route("/")
def home():
    """Serve the main HTML page"""
    try:
        return send_from_directory('.', 'index.html')
    except Exception as e:
        log_message(f"Error serving home page: {str(e)}")
        return "Error loading home page", 500

@app.route("/css/<path:filename>")
def css_files(filename):
    """Serve CSS files"""
    try:
        return send_from_directory('css', filename)
    except Exception as e:
        log_message(f"Error serving CSS file {filename}: {str(e)}")
        return "CSS file not found", 404

@app.route("/js/<path:filename>")
def js_files(filename):
    """Serve JavaScript files"""
    try:
        return send_from_directory('js', filename)
    except Exception as e:
        log_message(f"Error serving JS file {filename}: {str(e)}")
        return "JS file not found", 404

@app.route("/<path:filename>")
def static_files(filename):
    """Serve other static files with security check"""
    try:
        if not is_allowed_file(filename):
            log_message(f"Blocked attempt to access file: {filename}")
            return "File type not allowed", 403
        
        return send_from_directory('.', filename)
    except Exception as e:
        log_message(f"Error serving static file {filename}: {str(e)}")
        return "File not found", 404

# API Routes
@app.route("/api/news")
def get_news():
    """Main endpoint to fetch news articles"""
    try:
        # Get parameters from request
        category = request.args.get("category", "").lower()
        query = request.args.get("q", "")
        language = request.args.get("language", "en")
        from_date = request.args.get("from")
        to_date = request.args.get("to")
        
        log_message(f"News request - Category: '{category}', Query: '{query}', Language: '{language}'")
        
        # Validate category
        if category and category not in VALID_NEWS_CATEGORIES:
            log_message(f"Invalid category '{category}', using 'general' instead")
            category = "general"
        
        # Validate language (basic check)
        if len(language) != 2:
            log_message(f"Invalid language code '{language}', using 'en' instead")
            language = "en"
        
        # Fetch news from API
        news_data = fetch_news(category, query, language, from_date, to_date)
        
        # Ensure we have articles key
        if 'articles' not in news_data:
            news_data['articles'] = []
        
        # Clean articles
        original_count = len(news_data.get('articles', []))
        news_data['articles'] = clean_articles(news_data.get('articles', []))
        final_count = len(news_data['articles'])
        
        log_message(f"Articles: {original_count} fetched, {final_count} after cleaning")
        
        # Add metadata
        news_data['metadata'] = {
            'total_results': final_count,
            'category': category if category else 'all',
            'language': language,
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(news_data)
        
    except Exception as e:
        error_msg = f"Error fetching news: {str(e)}"
        log_message(error_msg)
        return jsonify({
            "error": error_msg,
            "articles": [],
            "status": "error",
            "metadata": {
                'total_results': 0,
                'timestamp': datetime.now().isoformat()
            }
        }), 500

@app.route("/api/categories")
def get_categories():
    """Get list of available news categories"""
    try:
        categories = [cat for cat in VALID_NEWS_CATEGORIES if cat]  # Remove empty string
        return jsonify({
            "categories": categories,
            "status": "success"
        })
    except Exception as e:
        log_message(f"Error getting categories: {str(e)}")
        return jsonify({
            "error": str(e),
            "categories": [],
            "status": "error"
        }), 500

@app.route("/api/test")
def test_backend():
    """Test endpoint to check if backend is working"""
    try:
        # Check API key
        api_key_configured = bool(os.getenv("NEWS_API_KEY"))
        
        test_result = {
            "status": "Backend is working!",
            "test_passed": True,
            "api_key_configured": api_key_configured,
            "version": "1.1.0",
            "timestamp": datetime.now().isoformat()
        }
        
        if not api_key_configured:
            test_result["warning"] = "NEWS_API_KEY not configured"
        
        return jsonify(test_result)
        
    except Exception as e:
        log_message(f"Test endpoint error: {str(e)}")
        return jsonify({
            "status": "Backend has issues",
            "test_passed": False,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route("/api/health")
def health_check():
    """Health check endpoint"""
    try:
        return jsonify({
            "status": "healthy",
            "service": "FetchPress API",
            "version": "1.1.0",
            "timestamp": datetime.now().isoformat(),
            "uptime": "running"
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# Backward compatibility routes
@app.route("/news")
def get_news_old():
    """Old news endpoint for backward compatibility"""
    log_message("Using deprecated /news endpoint, please use /api/news")
    return get_news()

# Error handlers
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    log_message(f"404 error: {request.url}")
    return jsonify({
        "error": "Endpoint not found",
        "requested_url": request.url,
        "status": 404
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    log_message(f"500 error: {str(error)}")
    return jsonify({
        "error": "Internal server error",
        "status": 500
    }), 500

@app.errorhandler(403)
def forbidden(error):
    """Handle 403 errors"""
    log_message(f"403 error: {str(error)}")
    return jsonify({
        "error": "Access forbidden",
        "status": 403
    }), 403

# Startup function
def check_environment():
    """Check if environment is properly configured"""
    log_message("Checking environment configuration...")
    
    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        log_message("  WARNING: NEWS_API_KEY not found!")
        log_message("   Please create a .env file with your NewsAPI key")
        log_message("   Example: NEWS_API_KEY=your_api_key_here")
        return False
    else:
        log_message(" NEWS_API_KEY configured")
        return True

# Main execution
if __name__ == "__main__":
    log_message("Starting FetchPress News Server...")
    log_message(f"Version: 1.1.0")
    
    # Check environment
    env_ok = check_environment()
    
    # Start server
    log_message(" Server starting...")
    log_message(" Frontend available at: http://localhost:5000")
    
    if not env_ok:
        log_message("  Server will start but news fetching may not work without API key")
    
    log_message("-" * 50)
    
    # Run Flask app
    app.run(
        debug=DEBUG_MODE, 
        port=5000, 
        host='0.0.0.0',
        use_reloader=True
    )