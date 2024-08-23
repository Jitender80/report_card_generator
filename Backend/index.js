require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const path = require("path");
const xlsx = require("xlsx");
const { uploadFile } = require("./controllers/excelFile");
const prisma = new PrismaClient();

const cors = require("cors");
const { createClass } = require("./controllers/class");
const { deleteAllData } = require("./controllers/dev");
const app = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());

app.use(cors());
app.get("/", (req, res) => {
  res.json({ message: "pong working" });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Initialize multer with the configured storage
const upload = multer({ storage: storage });

app.use("/auth", authRoutes);

// ********************************************************************************************
// Dev

app.delete("/cleanClass", deleteAllData);
// ********************************************************************************************

app.post("/createClass", createClass);

app.use("/upload", upload.single("file"), uploadFile);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
