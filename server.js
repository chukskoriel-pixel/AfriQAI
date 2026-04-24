const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Path to JSON file
const dataPath = path.join(__dirname, "data", "stories.json");

// GET all news
app.get("/api/news", (req, res) => {
    fs.readFile(dataPath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error reading data" });
        }

        res.json(JSON.parse(data));
    });
});

// POST new article (for admin later)
app.post("/api/news", (req, res) => {
    const newArticle = req.body;

    fs.readFile(dataPath, "utf8", (err, data) => {
        let articles = [];

        if (!err && data) {
            articles = JSON.parse(data);
        }

        articles.unshift(newArticle);

        fs.writeFile(dataPath, JSON.stringify(articles, null, 2), err => {
            if (err) {
                return res.status(500).json({ error: "Error saving data" });
            }

            res.json({ message: "Article added successfully" });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});