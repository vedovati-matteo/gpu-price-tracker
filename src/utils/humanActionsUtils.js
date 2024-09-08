// Function to simulate human-like scrolling and mouse movement
async function humanScroll(page, maxScrollTime = 10000) {
    const scrollDelay = () => Math.floor(Math.random() * 400) + 100; // Random delay between 200-600ms
    const startTime = Date.now();

    while (Date.now() - startTime < maxScrollTime) {
        // Random mouse movement
        const x = Math.floor(Math.random() * (page.viewport().width - 100)) + 50;
        const y = Math.floor(Math.random() * (page.viewport().height - 100)) + 50;
        await page.mouse.move(x, y, { steps: Math.floor(Math.random() * 5) + 3 });

        // Occasional pause
        if (Math.random() < 0.1) {
            await new Promise(r => setTimeout(r, Math.floor(Math.random() * 2000) + 500));
        }

        // Scroll by a random amount with variable speed
        const scrollAmount = Math.floor(Math.random() * 600) + 100;
        await page.evaluate(async (amount) => {
            return new Promise((resolve) => {
                const duration = Math.floor(Math.random() * 400) + 300;
                const start = window.pageYOffset;
                const startTime = performance.now();
                
                function step() {
                    const elapsed = performance.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = t => t<.5 ? 2*t*t : -1+(4-2*t)*t; // Ease in-out quadratic
                    window.scrollTo(0, start + amount * ease(progress));
                    
                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        resolve(); // Resolve when the scroll is complete
                    }
                }
                
                requestAnimationFrame(step);
            });
        }, scrollAmount);

        await new Promise(r => setTimeout(r, scrollDelay()));

        const isAtBottom = await page.evaluate(() => {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;   
        
        
            return scrollTop + windowHeight >= documentHeight;   
        
          });
        
          if (isAtBottom) {
            break;
          }
    }
}

module.exports = { humanScroll };