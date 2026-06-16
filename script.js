const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const app = express();

app.use(cors());

// Root path response (taake error na aaye)
app.get('/', (req, res) => {
    res.send('Mepco Bill Checker API is running smoothly!');
});

// Main Bill Checker route
app.get('/check-bill', async (req, res) => {
    const ref = req.query.ref;
    if (!ref) return res.status(400).json({ error: "Reference number required" });

    let browser;
    try {
        // Puppeteer launch configuration
        browser = await puppeteer.launch({ 
            headless: "new", 
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        const page = await browser.newPage();
        await page.goto('https://bill.pitc.com.pk/', { waitUntil: 'networkidle2' });
        
        await page.type('input[name="ref"]', ref);
        await page.click('button[type="submit"]');
        
        // Wait for table to appear
        await page.waitForSelector('table', { timeout: 15000 });

        const billData = await page.evaluate(() => document.body.innerText);
        await browser.close();
        
        res.json({ status: "success", htmlPreview: billData });
    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ error: "Failed to fetch: " + error.message });
    }
});

app.listen(process.env.PORT || 3000);
