const { getSource } = require('../repositories/sourceRepository');

const commandHandlers = {
    '/start': (bot, chatId) => {
        bot.sendMessage(chatId, 'Welcome! I am your scraping bot assistant. Type /help for commands.');
    },

    '/help': (bot, chatId) => {
        bot.sendMessage(chatId, 'Available commands:\n\t- /start: Start the bot\n\t- /status: Get the status of the scraper.\n\t- /execute <source>: Execute a scraping run for the specified source (it will update the products scraped of this day scrape run), if no source is specified then it will do the daily scraping run (or redo it if already done). Source can be: "ebay", "hardware-planet", or "mediaworld" (you can use "captcha" for testing the captcha solver functionality).\n\t- /captcha: Captcha request solved.');
    },

    '/status': (bot, chatId) => {
        bot.sendMessage(chatId, bot.printRunStatus());
    },

    '/execute': async (bot, chatId, source) => {
        if (bot.scraperStatus && bot.scraperStatus.status === 'running') {
            bot.sendMessage(chatId, 'The scraper is already running. Please wait until it finishes.');
            return;
        }

        if (source && source === 'captcha') { // Run the scraper for testing the captcha solving
            bot.sendMessage(chatId, `Testing out captcha solver functionality.`);
            sourceObj = {source: 'captcha', proxy: false};
            bot.scheduler.runScraper(sourceObj);
            return;
        }

        if (source && ['ebay', 'hardware-planet', 'mediaworld'].includes(source)) {

            sourceObj = await getSource(source);

            bot.scheduler.runScraper(sourceObj);
            bot.sendMessage(chatId, `The scraper is executing your request of scraping the GPUs of ${source}.`);
        } else {
            const now = new Date();
            if (bot.scrapeDate.toDateString() == now.toDateString()) {
                bot.scheduler.runNow();
                bot.sendMessage(chatId, 'The daily scraping is running now.');
            } else {
                bot.scheduler.runScraper();
                bot.sendMessage(chatId, 'Redoing the daily run.');
            }
        }
    },

    '/captcha': (bot, chatId) => {
        if (!bot.waitingForCaptcha) {
            bot.sendMessage(chatId, 'No captcha was requested.');
            return;
        }

        bot.scraperProcess.send({ type: 'captcha-solved' });
        bot.waitingForCaptcha = false;
        bot.sendMessage(chatId, 'Captcha solved. Resuming the scraping...');
    }
};

module.exports = commandHandlers;