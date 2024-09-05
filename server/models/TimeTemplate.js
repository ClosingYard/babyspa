const { DataTypes } = require('sequelize');
const sequelize = require('../database'); // Adjust the path if needed

const TimeTemplate = sequelize.define('TimeTemplate', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    times: {
        type: DataTypes.JSONB, // Use JSONB or TEXT based on your database type
        allowNull: false
    }
});

module.exports = TimeTemplate;
