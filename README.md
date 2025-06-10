# FetchPress 📰
A modern news aggregator web application that provides filtered news based on categories and search queries with a clean, elegant interface.

## ✨ Features

- **Category-based News Filtering**: Browse news by Sports, Technology, Business, Politics, Health, or General News
- **Smart Search**: Find specific news articles using the search functionality
- **Theme Toggle**: Switch between dark and light themes for comfortable reading
- **Bookmark Articles**: Save articles to local storage for later reading
- **Direct Source Access**: "Read More" button redirects to original news articles
- **Modern UI**: Clean and elegant design with smooth user experience

## 🛠️ Technologies Used

### Frontend
- **HTML5** - Structure and markup
- **Tailwind CSS** - Styling and responsive design
- **JavaScript** - Interactive functionality and API calls

### Backend
- **Python Flask** - Web framework and server
- **NewsAPI** - News data source

## 📁 Project Structure

## 🚀 Installation & Setup

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)
- NewsAPI key (free from [newsapi.org](https://newsapi.org))

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/fetchpress.git
   cd fetchpress
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   - Create a `.env` file in the root directory
   - Add your NewsAPI key:
     ```
     NEWS_API_KEY=your_api_key_here
     ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5000`
   - Start browsing news!

## 🔧 Configuration

### Getting NewsAPI Key
1. Visit [newsapi.org](https://newsapi.org)
2. Sign up for a free account
3. Copy your API key
4. Add it to your `.env` file

### Environment Variables
```env
NEWS_API_KEY=your_newsapi_key_here
FLASK_ENV=development
FLASK_DEBUG=True
```

## 📱 Usage

1. **Browse by Category**: Click on navbar categories (Sports, Technology, Business, Politics, Health)
2. **Search News**: Use the search bar to find specific topics
3. **Save Articles**: Click the "Save" button on any news card to bookmark it
4. **View Saved Articles**: Click the bookmark icon in the header to see saved articles
5. **Switch Themes**: Toggle between dark and light mode using the theme switch
6. **Read Full Articles**: Click "Read More" to visit the original news source

## 🔮 Future Enhancements

- [ ] User authentication and registration
- [ ] Database integration for cross-device article saving
- [ ] Date-based news filtering
- [ ] Real-time news updates
- [ ] Social media sharing
- [ ] Article recommendations based on reading history
- [ ] Newsletter subscriptions
- [ ] Mobile app (PWA)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [NewsAPI](https://newsapi.org) for providing the news data
- [Tailwind CSS](https://tailwindcss.com) for the beautiful styling framework
- [Flask](https://flask.palletsprojects.com) for the lightweight web framework

⭐ **Star this repository if you found it helpful!**