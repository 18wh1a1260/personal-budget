const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const port = 3000;

app.use('/', express.static('public'));

app.use(cors());

// Load budget data from JSON file
let budget = {};
fs.readFile('budget-data.json', 'utf8', (err, data) => {
    if (err) {
        console.error(err);
        return;
    }
    budget = JSON.parse(data);
});

app.get('/hello', (req, res) => {
    res.send('Hello World');
});

app.get('/budget', (req, res) => {
    res.json(budget);
});

app.listen(port, () => {
    console.log(`API served at http://localhost:${port}`);
});
