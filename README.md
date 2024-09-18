# 🖥️ GPU Price Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v14+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-20.10+-blue.svg)](https://www.docker.com/)

## 🌟 Overview

GPU Price Tracker is a sophisticated web scraping project that monitors and analyzes GPU prices across multiple e-commerce platforms. Built with scalability and efficiency in mind, this project demonstrates advanced scraping techniques, data management, and full-stack development skills.

### 🎯 Key Features

- 🕷️ Scrapes GPU prices from eBay, Mediaworld, and Hardware-planet
- 💾 Stores historical price data in MongoDB
- 🔄 Implements proxy rotation with free proxy lists
- 🤖 Handles CAPTCHAs through innovative user intervention via Telegram bot
- 📊 Visualizes price trends and comparisons through a reactive Next.js frontend
- 🐳 Containerized with Docker for easy deployment and scaling

## 🛠️ Technologies

- **Backend**: Node.js, Express.js
- **Scraping**: Puppeteer
- **Database**: MongoDB with Mongoose
- **Frontend**: Next.js, Shadcn/UI
- **DevOps**: Docker, Docker Compose, Nginx
- **Bot Integration**: Telegram Bot API

## 🏗️ Architecture

The project follows a modular architecture, separating concerns for improved maintainability and scalability:

- `src/api.js`: RESTful API endpoints
- `src/db/`: Database connection and schema definitions
- `src/models/`: Mongoose models for data structures
- `src/repositories/`: Data access layer
- `src/scheduler.js`: Orchestrates scraping jobs
- `src/scraper/`: Custom scrapers for each e-commerce platform
- `src/services/`: Core business logic, including proxy management and CAPTCHA handling
- `src/telegram/`: Telegram bot integration for notifications and manual interventions
- `src/web/my-app/`: Next.js frontend application

## 🚀 Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/vedovati-matteo/gpu-price-tracker.git
   ```

2. Install dependencies:
   ```
   cd PriceCompare
   npm install
   ```

3. Set up environment variables:
    Craete the .env file in the root directory and add the following variables:
    ```
   MONGO_INITDB_ROOT_USERNAME=...
    MONGO_INITDB_ROOT_PASSWORD=...
    MONGO_PRICECOMPARE_USERNAME=...
    MONGO_PRICECOMPARE_PASSWORD=...
    TELEGRAM_BOT_TOKEN=...
    PORT=3000
   ```
   Replace the `...` with your actual values. These variables are crucial for:

    - Connecting to your MongoDB instance
    - Authenticating your Telegram bot
    - Setting the port for your application

4. Start the application:
   ```
   docker-compose up -d
   ```

5. Access the application:
- Backend server: `http://localhost:3000`
- Frontend interface: `http://localhost:3001`

## 🧠 Advanced Features

### Proxy Rotation
The project implements a smart proxy rotation system to ensure optimal performance and avoid detection:

- **Proxy Source**: Free proxies are obtained from [ProxyScrape](https://proxyscrape.com/free-proxy-list), a reliable source for free proxy lists.
- **Proxy Testing**: Each proxy is rigorously tested before use to ensure functionality.
- **Categorization**: Proxies are categorized based on their performance:
  - Functional proxies are used for regular scraping operations.
  - Proxies that encounter CAPTCHAs are segregated into a separate list for strategic use.
- **Fallback Mechanism**: When all functional proxies are exhausted, the system cleverly falls back to the CAPTCHA-prone list, balancing scraping speed with CAPTCHA challenges.

### CAPTCHA Handling
When encountered, CAPTCHAs are solved through a unique system leveraging Telegram bot notifications and noVNC for remote desktop access, allowing for manual intervention without breaking the scraping flow.

### Bot Detection Avoidance
Implements various techniques to mimic human behavior, including:
- Dynamic user agent rotation
- Realistic scrolling patterns
- Randomized delays between actions

### Telegram Bot Integration
The Telegram bot serves as a powerful tool for monitoring and controlling the scraping process:

**Command List:**
- `/start`: Initiates the bot with a welcome message and prompts to explore commands.
- `/help`: Provides a concise guide to the bot's capabilities.
- `/status`: Displays the current status of the scraping process, including active runs and next scheduled runs.
- `/execute [source]`: Triggers a scraping run. Can focus on specific sources or test CAPTCHA functionality.
- `/captcha`: Signals successful CAPTCHA resolution, allowing the scraper to resume.

**Additional Functionality:**
- **CAPTCHA Requests**: Notifies the developer when a CAPTCHA is encountered, providing a noVNC link for manual solving.
- **Status Updates**: Keeps the developer informed about scraping progress across different platforms.
- **Run Completion Reports**: Provides comprehensive summaries after each scraping run.
- **Reminders**: Sends notifications before scheduled scraping runs.

## 📈 Data Visualization

The frontend provides intuitive visualizations of GPU prices, including:
- Current prices across different platforms
- Historical price trends
- Comparative analysis tools

## 🌐 Deployment

1. **Server Environment:**
   - Deployed on a DigitalOcean droplet (VPS)
   - Runs on a Linux operating system

2. **Frontend Access:**
   - The live frontend application is accessible at: [https://pricecoma.tech/](https://pricecoma.tech/)
   - Features up-to-date GPU price information, automatically updated daily

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📬 Contact

For any queries or suggestions, please open an issue or contact the maintainer at [matteo.vedovati.77@gmail.com](mailto:matteo.vedovati.77@gmail.com).

---

Built with ❤️ by Matteo Vedovati