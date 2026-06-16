const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());

app.get('/check-bill', async (req, res) => {
    const ref = req.query.ref;
    if (!ref) return res.status(400).json({ error: "Reference number required" });

    // ScraperAPI ki key
    const API_KEY = 'fd222ed124e2235dbf32623c598e30cf';

    try {
        // MEPCO ki site par request bhejne ka naya tareeqa
        const response = await axios.get('http://api.scraperapi.com', {
            params: {
                api_key: API_KEY,
                url: 'https://bill.pitc.com.pk/mepcobill/general',
                render: 'false', // Browser nahi kholna, direct data chahiye
                // MEPCO ke liye POST request zaroori hai, isliye hum scraper ko instruct kar rahe hain
                keep_headers: 'true'
            }
        });

        res.json({ status: "success", data: response.data });
    } catch (error) {
        res.status(500).json({ error: "Scraping failed: " + error.message });
    }
});

app.listen(process.env.PORT || 3000);
