const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require("multer");
const path = require("path");
const fs = require("fs");

dotenv.config();

const app = express();

// ── 1. FOLDER CREATION (The "Automatic" Way) ──────────────────────────────────
// This ensures the folders exist before the server starts accepting requests.
const uploadDir = path.join(__dirname, "public", "images");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Folder created:", uploadDir);
}

// ── 2. MIDDLEWARE ─────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
// Serve the images folder so you can access them via URL
// Example: http://localhost:5000/images/17123456.jpg
app.use("/images", express.static(uploadDir));

// ── 3. DATABASE CONNECTION ────────────────────────────────────────────────────
const dbUri = process.env.MONGO_URI;
mongoose.connect(dbUri)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Error:", err));

// ── 4. MULTER STORAGE CONFIGURATION ───────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Clean filename: timestamp + original name (no spaces)
        const uniqueSuffix = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
        cb(null, uniqueSuffix);
    },
});

const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
            cb(null, true);
        } else {
            cb(new Error("Only images and videos are allowed!"), false);
        }
    }
});

// ── 5. THE UPLOAD ROUTE ───────────────────────────────────────────────────────
app.post("/api/upload", (req, res) => {
    // Manual invocation of multer to catch errors properly
    upload.single("file")(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ error: "Please upload a file" });
        }

        try {
            // Optional: If you want to save this to a Post immediately:
            // const newPost = new Post({ ...req.body, img: req.file.filename });
            // await newPost.save();

            res.status(200).json({ 
                message: "File uploaded successfully", 
                fileName: req.file.filename,
                url: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
            });
        } catch (dbErr) {
            res.status(500).json({ error: "File saved but DB entry failed" });
        }
    });
});

// ── 6. OTHER API ROUTES ───────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/users", require("./routes/users"));

// ── 7. START SERVER ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});