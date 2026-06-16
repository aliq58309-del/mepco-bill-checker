const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send('Mepco Bill Checker API is running fast using Axios!');
});

app.get('/check-bill', async (req, res) => {
    const ref = req.query.ref;
    if (!ref) return res.status(400).json({ error: "Reference number required" });

    try {
        // MEPCO ki website ka form submit karna
        const response = await axios.post('https://bill.pitc.com.pk/mepcobill/general', 
            `ref=${ref}`, {
            headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const billData = $('body').text(); 

        // Agar result table mil jaye
        res.json({ status: "success", data: billData });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch: " + error.message });
    }
});

app.listen(process.env.PORT || 3000);
