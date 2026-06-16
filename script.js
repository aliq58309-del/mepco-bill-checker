const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer'); 
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send('Mepco Bill Checker API is running perfectly!');
});

app.get('/check-bill', async (req, res) => {
    const ref = req.query.ref;
    if (!ref) return res.status(400).json({ error: "Reference number required" });

    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: "new", 
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--single-process',
                '--no-zygote'
            ]
        });
        
        const page = await browser.newPage();
        // User agent set karna zaroori hai taake site block na kare
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36");
        
        await page.goto('https://bill.pitc.com.pk/', { waitUntil: 'networkidle2' });
        
        await page.type('input[name="ref"]', ref);
        await page.click('button[type="submit"]');
        
        await page.waitForSelector('table', { timeout: 20000 });

        const billData = await page.evaluate(() => document.body.innerText);
        await browser.close();
        
        res.json({ status: "success", htmlPreview: billData });
    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ error: "Scraping failed: " + error.message });
    }
});

app.listen(process.env.PORT || 3000);
