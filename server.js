require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const mongoose = require("mongoose");
const app = express();
const ShortUrl = require("./shorturl");

// Global variables
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());

app.use(express.json());
app.use(express.urlencoded());

app.use("/public", express.static(`${process.cwd()}/public`));

// Endpoints
app.get("/", function (req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
    res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res) {
    const original_url = req.body.url;

    if (
        !original_url ||
        !(
            original_url.startsWith("http://") ||
            original_url.startsWith("https://")
        )
    )
        return res.json({ error: "Invalid URL" });

    const url = new URL(original_url);
    dns.lookup(url.host, async (err, address, family) => {
        if (err) return res.json({ error: "Invalid Hostname" });
        const allURL = await ShortUrl.find();
        const short_url = allURL.length;
        const newURL = new ShortUrl({
            original_url,
            short_url,
        });

        const equal = await ShortUrl.findOne({ original_url });

        if (!equal) {
            await newURL.save();
            return res.json({ original_url, short_url });
        }
        return res.json({
            original_url: equal.original_url,
            short_url: equal.short_url,
        });
    });
});

app.get("/api/shorturl/:number", async (req, res) => {
    const num = req.params.number;
    const urlObject = await ShortUrl.findOne({ short_url: num });

    if (urlObject) return res.redirect(urlObject.original_url);

    return res.json({
        error: "No short URL found for the given input",
    });
});

// Database connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Server initialization
app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
