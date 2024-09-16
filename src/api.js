const { getSources } = require('./repositories/sourceRepository');
const { getProductPrices, getSourcePrices, getDailyPrices } = require('./repositories/priceRepository');
const { getProducts } = require('./repositories/productRepository');


class Api {
    constructor(app) {
        this.app = app;
    }

    setupApiRoutes() {
                
        // Get all products
        this.app.get('/api/products', async (req, res) => {
            const products = await getProducts();
            res.json(products);
        });

        // Gat all sources
        this.app.get('/api/sources', async (req, res) => {
            const sources = await getSources();
            res.json(sources);
        });

        // Get prices for a specific GPU across all e-commerce sites
        this.app.get('/api/prices/product/:productName', async (req, res) => {
            const { productName } = req.params;
            const prices = await getProductPrices(gpuName);
            res.json(prices);
        });

        // Get prices for all GPUs on a specific e-commerce site
        this.app.get('/api/prices/source/:eCommerce', async (req, res) => {
            const { eCommerce } = req.params;
            const prices = await getSourcePrices(eCommerce);
            res.json(prices);
        });

        // Get current prices
        this.app.get('/api/prices/current', async (req, res) => {
            const currentPrices = await getDailyPrices();
            res.json(currentPrices);
        });

        // Get prices for a specific date
        this.app.get('/prices/date/:date', async (req, res) => {
            const { date } = req.params;
            const prices = await getDailyPrices(date);
            res.json(prices);
        });
    }
}

module.exports = Api;