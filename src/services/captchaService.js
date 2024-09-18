const readline = require('readline');
const os = require('os');

async function checkCaptcha(page) {
    // Initialize a variable to determine if CAPTCHA is present
    let isCaptchaPresent = false;
    let captchaType = null;

    // Detect common signs of a CAPTCHA
    const captchaSelectors = [
        'div.g-recaptcha',          // reCAPTCHA v2
        'input[name="g-recaptcha-response"]', // reCAPTCHA v3
        'div.h-captcha',            // hCaptcha
        'iframe[src*="challenge"]', // Cloudflare CAPTCHA iframe
        'img[src*="captcha"]',      // Simple image CAPTCHAs
        'img[alt*="captcha"]',
        'form.challenge-form',      // Cloudflare CAPTCHA form
    ];

    // Iterate over selectors to see if any CAPTCHA is present
    for (let selector of captchaSelectors) {
        const element = await page.$(selector);
        if (element) {
            isCaptchaPresent = true;
            break;
        }
    }

    // If a CAPTCHA is detected, classify its type
    if (isCaptchaPresent) {
        // Check for Google reCAPTCHA v2
        const recaptchaV2 = await page.$('div.g-recaptcha');
        if (recaptchaV2) {
            console.log('reCAPTCHA v2 detected');
            captchaType = 'reCAPTCHA v2';
        }

        // Check for Google reCAPTCHA v3
        const recaptchaV3Token = await page.$('input[name="g-recaptcha-response"]');
        if (recaptchaV3Token && captchaType === null) {
            console.log('reCAPTCHA v3 detected');
            captchaType = 'reCAPTCHA v3';
        }

        // Check for hCaptcha
        const hCaptcha = await page.$('div.h-captcha');
        if (hCaptcha) {
            console.log('hCaptcha detected');
            captchaType = 'hCaptcha';
        }

        // Check for Cloudflare CAPTCHA
        const cloudflareCaptcha = await page.$('iframe[src*="challenge"]');
        if (cloudflareCaptcha) {
            console.log('Cloudflare CAPTCHA detected');
            captchaType = 'Cloudflare CAPTCHA';
        }

        // Check for Cloudflare CAPTCHA
        const cloudflareCaptchaForm = await page.$('form.challenge-form');
        if (cloudflareCaptchaForm) {
            console.log('Cloudflare CAPTCHA from detected');
            captchaType = 'Cloudflare CAPTCHA form';
        }

        // If none of the above are detected, it remains unclassified
        if (captchaType === null) {
            captchaType = 'Unclassified CAPTCHA';
        }
    }

    // Return whether a CAPTCHA is present and its classification
    return {
        isCaptchaPresent: isCaptchaPresent,
        captchaType: captchaType || 'None',
    };
}



async function solveCaptcha(page, captchaType) {
    try {
        // Placeholder for CAPTCHA solving logic
        console.log(`Asking to solver ${captchaType}...`);

        const ip_id = getRemoteDebuggingIPandID(page);
        console.log('IP and ID:', ip_id);

        if (process.send) {
            process.send({ type: 'captcha', captchaType: captchaType, link: ip_id.ip, targetId: ip_id.targetId });
        }

        if (process.on) {
            await waitForCaptchaSolution()
        } else {
            waitForUserInput('Press any key to continue...');
        }

        console.log('Continuing with the scraping...');

        return true;
    } catch (error) {
        console.error('Error occurred while solving CAPTCHA:', error);
        return false;
    }
    

}

function waitForCaptchaSolution() {
    console.log('Waiting for CAPTCHA solution...');
    return new Promise((resolve, reject) => {
        process.on('message', (message) => {
            if (message.type === 'captcha-solved') {
                resolve();
            }
        });
    });
}

function waitForUserInput(prompt) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => rl.question(prompt, (answer) => {
        rl.close();
        resolve(answer);
    }));
}

function getRemoteDebuggingIPandID(page) {
    const networkInterfaces = os.networkInterfaces();
    let serverIP;

    for (const interfaceName in networkInterfaces) {
        const interfaces = networkInterfaces[interfaceName];
        for (const interfaceInfo of interfaces) {
            if (interfaceInfo.family === 'IPv4' && !interfaceInfo.internal) {
            serverIP = interfaceInfo.address;
            break;
            }
        }
        if (serverIP) {
            break;
        }
    }

    const targetId = page.target()._targetId;
    return {ip: `${serverIP}:${process.env.PUPPETEER_DEBUG_PORT}`, targetId: targetId};
}

module.exports = { checkCaptcha, solveCaptcha };