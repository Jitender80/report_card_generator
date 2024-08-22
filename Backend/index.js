require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const xlsx = require('xlsx');
const { uploadFile } = require('./controllers/upload');

const prisma = new PrismaClient();
const upload = multer({ dest: 'uploads/' });

const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({ message: 'pong working' });
});

app.use('/auth', authRoutes);

app.use('/upload', upload.single('file'), uploadFile);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});