const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.deleteAllData = async (req, res) => {
  try {
    // Delete all questions first to avoid foreign key constraint issues
    await prisma.question.deleteMany({});
    // Delete all students
    await prisma.student.deleteMany({});

    res.status(200).json({ message: 'All data deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete data' });
  }
};