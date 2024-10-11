const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const BudgetModel = require('./models/BudgetModel');  // Import the Budget model

const app = express();
const port = 3000;

app.use(express.json());  // To parse JSON bodies
app.use('/', express.static('public'));
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/personal_budget', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Error connecting to MongoDB:", err));

// Load data from JSON and insert into MongoDB
const loadBudgetData = async () => {
    fs.readFile('budget-data.json', 'utf8', async (err, data) => {
        if (err) {
            console.error("Error reading file:", err);
            return;
        }
        try {
            const budgetData = JSON.parse(data).myBudget;

            // Check if there are any budget entries in the database
            const existingDataCount = await BudgetModel.countDocuments({});
            if (existingDataCount === 0) {
                // If no data exists, insert the budget data
                await BudgetModel.insertMany(budgetData.map(item => ({
                    title: item.title,
                    budget: item.budget,
                    color: item.color || "#000000"  // Default color if none provided
                })));
                console.log("Budget data loaded into MongoDB");
            } else {
                console.log("Budget data already exists, skipping insertion.");
            }
        } catch (err) {
            console.error("Error parsing or inserting data:", err);
        }
    });
};


// Endpoint to fetch budget data
app.get('/budget', async (req, res) => {
    try {
        const budgetData = await BudgetModel.find({});
        res.json({ myBudget: budgetData });
    } catch (error) {
        res.status(500).json({ message: "Error fetching budget data", error });
    }
});

// Endpoint to add new budget data
app.post('/budget', async (req, res) => {
    const { title, budget, color } = req.body;
    
    // Check if the budget item already exists
    const existingBudgetItem = await BudgetModel.findOne({ title });
    if (existingBudgetItem) {
        return res.status(400).json({ message: "Budget item already exists" });
    }

    // Create and save new budget item
    try {
        const newBudgetItem = new BudgetModel({ title, budget, color });
        await newBudgetItem.save();
        res.status(201).json({ message: "Budget item created successfully", data: newBudgetItem });
    } catch (error) {
        res.status(500).json({ message: "Error creating budget item", error });
    }
});

// Endpoint to delete a budget item by ID
app.delete('/budget/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedBudgetItem = await BudgetModel.findByIdAndDelete(id);
        if (!deletedBudgetItem) {
            return res.status(404).json({ message: "Budget item not found" });
        }
        res.json({ message: "Budget item deleted successfully", data: deletedBudgetItem });
    } catch (error) {
        res.status(500).json({ message: "Error deleting budget item", error });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`API served at http://localhost:${port}`);
    loadBudgetData();  // Call the function to load the data when the server starts
});
