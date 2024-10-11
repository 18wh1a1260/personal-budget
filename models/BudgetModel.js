const mongoose = require('mongoose');

// Define the schema for budget data
const budgetSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true,
        match: /^#[0-9A-Fa-f]{6}$/
    }
});

const BudgetModel = mongoose.model('Budget', budgetSchema);

module.exports = BudgetModel;
