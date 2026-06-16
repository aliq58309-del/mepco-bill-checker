const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());

app.get('/check-bill', async (req, res) => {
    const ref = req.query.ref;
    if (!ref) return res.status(400).json({ error: "Reference number required" });

    const API_KEY = 'fd222ed124e2235dbf32623c598e30cf';

    try {
        // ScraperAPI ke zariye POST request bhejna
        const response = await axios.post('http://api.scraperapi.com', {
            apiKey: API_KEY,
            url: 'https://bill.pitc.com.pk/mepcobill/general',
            body: `ref=${ref}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        res.json({ status: "success", data: response.data });
    } catch (error) {
        // Error details check karne ke liye
        res.status(500).json({ error: "Scraping failed: " + error.response?.data || error.message });
    }
});

app.listen(process.env.PORT || 3000);
