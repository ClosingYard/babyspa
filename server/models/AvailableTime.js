const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const AvailableTime = sequelize.define('AvailableTime', {
    date: {
        type: DataTypes.STRING,
        allowNull: false
    },
    time: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = AvailableTime;
