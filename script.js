const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send('Mepco Bill Checker API is running!');
});

app.get('/check-bill', async (req, res) => {
    const ref = req.query.ref;
    if (!ref) return res.status(400).json({ error: "Reference number required" });

    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: "new", 
            // Render ke liye zaroori arguments
            executablePath: '/usr/bin/google-chrome', 
            args: [
                '--no-sandbox', 
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--no-zygote'
            ] 
        });
        
        const page = await browser.newPage();
        await page.goto('https://bill.pitc.com.pk/', { waitUntil: 'networkidle2' });
        
        await page.type('input[name="ref"]', ref);
        await page.click('button[type="submit"]');
        
        await page.waitForSelector('table', { timeout: 20000 });

        const billData = await page.evaluate(() => document.body.innerText);
        await browser.close();
        
        res.json({ status: "success", htmlPreview: billData });
    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ error: "Failed to fetch: " + error.message });
    }
});

app.listen(process.env.PORT || 3000);
