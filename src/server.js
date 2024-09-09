const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const TelegramBot = require('./telegram/bot');
const Scheduler = require('./scheduler');

class ScraperServer {
    constructor() {
        this.app = express();
        this.port = process.env.PORT;
        this.setupExpress();
        this.bot = new TelegramBot();
        this.scheduler = new Scheduler(this.bot);
        this.bot.scheduler = this.scheduler;

        mongoose.connect(process.env.MONGO_URI);
    }

    setupExpress() {
        this.app.use(express.json());
        this.app.use(bodyParser.json());

        this.app.post(`/bot${process.env.TELEGRAM_BOT_TOKEN}`, (req, res) => {
            console.log('Received request body:', JSON.stringify(req.body));
            this.bot.handleUpdate(req.body);
            res.sendStatus(200);
        });
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`ScraperTelegramServer listening on port ${this.port}`);
            this.bot.setWebhook();
        });
    }
}

const server = new ScraperServer();
server.start();