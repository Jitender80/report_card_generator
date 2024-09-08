const mongoose = require('mongoose');
const Student = require('../models/student');
const Class = require('../models/excelmodel');
exports.deleteAllData = async (req, res) => {
  try {
    // Delete all questions first to avoid foreign key constraint issues
    await Class.deleteMany({});
    // Delete all students
    await Student.deleteMany({});

    res.status(200).json({ message: 'All data deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete data' });
  }
};


exports.deleteData = async (req, res) => {

  try {
    const classId = req.params.id;
    const deletedClass = await Class.findByIdAndDelete(classId);

    if (!deletedClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }

}