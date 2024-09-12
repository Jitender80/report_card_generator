const mongoose = require('mongoose');
const Student = require('../models/student');
const Class = require('../models/excelmodel');



exports.generateFinalReport = async (req, res) => {


    try {
        


    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
        
    }
}



