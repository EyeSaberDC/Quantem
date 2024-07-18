const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const port = 3030;

app.use(express.static(__dirname));
app.use(express.static('.'));
app.use(express.json());

app.get('/api/items', async (req, res) => {
    try {
        const data = await fs.readFile(path.join(__dirname, 'items.json'), 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error reading items.json:', err);
        res.status(500).json({ error: 'Error reading items', details: err.message, stack: err.stack });
    }
});

app.post('/api/items', async (req, res) => {
    try {
        await fs.writeFile(path.join(__dirname, 'items.json'), JSON.stringify(req.body, null, 2));
        res.json({ success: true });
    } catch (err) {
        console.error('Error writing to items.json:', err);
        res.status(500).json({ error: 'Error writing items' });
    }
});

// Route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for the shop page
app.get('/shop', (req, res) => {
    res.sendFile(path.join(__dirname, 'shop.html'));
});

// Route for the cart page
app.get('/cart', (req, res) => {
    res.sendFile(path.join(__dirname, 'cart.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
