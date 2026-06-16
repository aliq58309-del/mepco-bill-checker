const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-core'); 
const chromium = require('@sparticuz/chromium');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send('Mepco Bill Checker API is running stable!');
});

app.get('/check-bill', async (req, res) => {
    const ref = req.query.ref;
    if (!ref) return res.status(400).json({ error: "Reference number required" });

    let browser;
    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
        
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
        
        // Timeout barha kar 60 seconds kar diya hai
        await page.goto('https://bill.pitc.com.pk/', { waitUntil: 'domcontentloaded', timeout: 60000 });
        
        // Wait for the input field to be available
        await page.waitForSelector('input[name="ref"]', { timeout: 30000 });
        await page.type('input[name="ref"]', ref);
        await page.click('button[type="submit"]');
        
        // Table ke load hone ka wait karein
        await page.waitForSelector('table', { timeout: 30000 });

        const billData = await page.evaluate(() => document.body.innerText);
        await browser.close();
        
        res.json({ status: "success", data: billData });
    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ error: "Scraping failed: " + error.message });
    }
});

app.listen(process.env.PORT || 3000);
