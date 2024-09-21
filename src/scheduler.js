const cron = require('node-cron');
const { fork } = require('child_process');

class Scheduler {
    constructor(bot) {
        this.bot = bot;
        this.scrapeTime = '16:00';
        this.cronJobs = []; // Initialize the cronJobs array
        this.setupCronJob();
    }

    setupCronJob() {
        this.scheduleScraper(this.scrapeTime, true);
    }

    scheduleScraper(time, today = true) {
        // Clear existing cron jobs
        this.cronJobs.forEach(job => job.stop());
        this.cronJobs = [];

        // Split the time into hours and minutes
        const [hour, minute] = time.split(':');
        
        // Get current time
        const now = new Date();
        
        // Set the scheduled time for today
        let scheduledTime = new Date(now);
        scheduledTime.setHours(hour, minute, 0, 0);
        
        // If today is true and the time has already passed, schedule for tomorrow
        if (today && scheduledTime <= now) {
            today = false;
        }
        
        // Generate cron expression for the scheduled task
        const cronExpression = today 
            ? `${minute} ${hour} * * *`
            : this.getTomorrowCronExpression(time);
        
        console.log(`Scheduling next scraping run for ${today ? 'today' : 'tomorrow'} at ${hour}:${minute}`);

        // Calculate the reminder time (10 minutes before the scheduled run)
        let reminderTime = new Date(scheduledTime);
        reminderTime.setMinutes(reminderTime.getMinutes() - 10);
        
        // Generate cron expression for the reminder
        const reminderCronExpression = today
            ? `${reminderTime.getMinutes()} ${reminderTime.getHours()} * * *`
            : this.getTomorrowCronExpression(`${reminderTime.getHours()}:${reminderTime.getMinutes()}`);
        
        // Set the bot's scrapeTime and scrapeDate
        this.bot.scrapeTime = time;
        this.bot.scrapeDate = today ? now : new Date(now.setDate(now.getDate() + 1));
        
        // Schedule the 10-minute reminder before the scraping run
        const reminderJob = cron.schedule(reminderCronExpression, () => {
            this.bot.sendMessage(this.bot.chatId, 'Scraping will start in 10 minutes!');
        });
        this.cronJobs.push(reminderJob);
        
        // Schedule the scraping task
        const scrapingJob = cron.schedule(cronExpression, () => {
            this.bot.sendMessage(this.bot.chatId, 'Starting the daily scraping run...');
            this.runScraper();
            this.scheduleScraper(this.bot.scrapeTime, false); // Recursively schedule for tomorrow after today's run
        });
        this.cronJobs.push(scrapingJob);
    }

    getTomorrowCronExpression(time) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return `${time.split(':')[1]} ${time.split(':')[0]} ${tomorrow.getDate()} ${tomorrow.getMonth() + 1} *`;
    }

    runScraper(source = null) {
        this.bot.initScraperRunStatus();

        let scraperProcess;

        if (source && source.source === 'captcha') {
            scraperProcess = fork('src/test/captchaTest.js', [JSON.stringify([source])]);
        } else {
            scraperProcess = source 
                ? fork('src/services/priceTrackingService.js', [JSON.stringify([source])])
                : fork('src/services/priceTrackingService.js');
        }

        this.bot.scraperProcess = scraperProcess;

        scraperProcess.on('message', (message) => {
            if (message.type === 'update-status') {
                console.log('Received update status message:', message);
                this.bot.updateRunStatus(message.status, message.progress);
            } else if (message.type === 'captcha') {
                console.log('Received update status message:', message);
                this.bot.requestCaptchaSolving(message.captchaType, message.link, message.targetId);
            }
        });

        scraperProcess.on('exit', () => {
            this.bot.completeScraping();
        });
    }

    runNow() {
        const now = new Date();
        const scheduledTime = new Date(now);
        const [hour, minute] = this.scrapeTime.split(':');
        scheduledTime.setHours(hour, minute, 0, 0);

        // Check if the scheduled run for today hasn't happened yet
        if (scheduledTime > now) {
            // If it hasn't, stop all current cron jobs
            this.cronJobs.forEach(job => job.stop());
            this.cronJobs = [];

            // Run the scraper immediately
            this.runScraper();

            // Reschedule for tomorrow
            this.scheduleScraper(this.scrapeTime, false);
        } else {
            // If today's run has already happened, just run the scraper without changing the schedule
            this.runScraper();
        }
    }

}

module.exports = Scheduler;