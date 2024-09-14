const mongoose = require('mongoose');
const Student = require('../models/student');
const Class = require('../models/excelmodel');



exports.generateFinalReport = async (req, res) => {
    const { academicYear,  semester } = req.body;

    try {

        const classes = await Class.aggregate([
            {
              $project: {
                academicYear: academicYear,

                semester: semester,
                // Add any additional fields you need here
              }
            }
          ]);
        


    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
        
    }
}



