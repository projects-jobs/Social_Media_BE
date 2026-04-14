const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();

// ✅ FIX: Create upload folder at server startup (before multer ever runs)
const uploadDir = path.join(__dirname, "public/images");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Created folder: public/images");
}

app.use(cors());
app.use(express.json());
app.use("/images", express.static(uploadDir));

// MongoDB Connection
const dbUri = process.env.MONGO_URI;
if (!dbUri) {
    console.error("❌ Error: MONGO_URI is not defined in .env file");
    process.exit(1);
}

mongoose.connect(dbUri)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// ✅ Multer — folder is guaranteed to exist by now, use absolute path
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const fileName = req.body.name
            ? req.body.name
            : Date.now() + path.extname(file.originalname);
        cb(null, fileName);
    },
});

const upload = multer({ storage });

// Upload Route
app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
        res.status(200).json("File uploaded successfully");
    } catch (error) {
        console.error(error);
        res.status(500).json("Error uploading file");
    }
});

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/users", require("./routes/users"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend server is running on port ${PORT}`);
});