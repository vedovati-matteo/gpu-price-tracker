const https = require('https');
const commandHandlers = require('./commands');

class TelegramBot {
    constructor() {
        this.token = process.env.TELEGRAM_BOT_TOKEN;
        this.webhookUrl = process.env.WEBHOOK_URL;
        this.chatId = null;
        this.waitingForCaptcha = false;
        this.scraperStatus = {status: 'idle', progress: []};
        this.scrapeTime = 'N/A';
        this.scrapeDate = null;
        this.scheduler = null;
    }

    handleUpdate(update) {
        console.log('Received update:', JSON.stringify(update));
        if (update.message && update.message.text) {
            const chatId = update.message.chat.id;
            this.chatId = chatId;
            const messageText = update.message.text;

            if (messageText.startsWith('/')) {
                const [command, ...args] = messageText.split(' ');
                if (commandHandlers[command]) {
                    commandHandlers[command](this, chatId, ...args);
                } else {
                    this.sendMessage(chatId, 'Unknown command. Please use /help for the list of available commands.');
                }
            }
        }
    }

    sendMessage(chatId, message) {
        const options = {
            hostname: 'api.telegram.org',
            path: `/bot${this.token}/sendMessage`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log(`Message sent to ${chatId}: ${message}`);
            });
        });

        req.on('error', (error) => {
            console.error('Error sending message:', error);
        });

        req.write(JSON.stringify({ chat_id: chatId, text: message }));
        req.end();
    }

    setWebhook() {
        const options = {
            hostname: 'api.telegram.org',
            path: `/bot${this.token}/setWebhook`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log('Telegram webhook set:', JSON.parse(data));
            });
        });

        req.on('error', (error) => {
            console.error('Error setting Telegram webhook:', error);
        });

        req.write(JSON.stringify({ url: `${this.webhookUrl}bot${this.token}` }));
        req.end();
    }

    initScraperRunStatus() {
        this.scraperStatus = {
            status: 'running',
            progress: [],
        };
    }

    updateRunStatus(status, progress) {
        if (this.scraperStatus.status != 'idle') {
            this.scraperStatus.status = status;
            if (this.scraperStatus.progress.length === 0) {
                this.scraperStatus.progress.push(progress);
            } else {
                const progressList = this.scraperStatus.progress;
                if (progress.source) {
                    const progressObj = { source: progress.source, total: progress.total, completed: 0 };
                    this.scraperStatus.progress.push(progressObj);
                } else {
                    this.scraperStatus.progress[progressList.length - 1].completed = progress.completed;
                }
            }
        }
    }

    requestCaptchaSolving(type, link, targetId) {
        this.sendMessage(this.chatId, `Solving ${type} needed:\n chrome://inspect\n IP and Port: ${link}\n TargetID: ${targetId}`);
        this.waitingForCaptcha = true;
    }

    completeScraping() {
        if (this.scraperStatus) {
            this.scraperStatus.status = 'completed';
            this.sendMessage(this.chatId, 'The scraping run has been completed. Here is the report: \n' + this.printRunStatus());
            this.scraperStatus = {status: 'idle', progress: []};
        }
    }

    printRunStatus() {
        if (this.scraperStatus.status === 'idle') {
            let now = new Date();

            return 'No scraping run in progress. Next run scheduled at: ' + this.scrapeTime + (this.scrapeDate.toDateString() == now.toDateString() ? ' today' : ' tomorrow');
        }

        const progressList = this.scraperStatus.progress;
        if (progressList.length === 0) {
            return `Scraper Status: ${this.scraperStatus.status}\nProgress: N/A`;
        }

        let printStr = `Scraper Status: ${this.scraperStatus.status}\nProgress:`;
        for (const progress of progressList) {
            printStr += `\nSource: ${progress.source}, completed: ${progress.completed}/${progress.total}`;
        }
        return printStr;
    }
}

module.exports = TelegramBot;