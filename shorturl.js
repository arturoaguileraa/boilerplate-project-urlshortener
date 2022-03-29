const mongoose = require("mongoose");
const { Schema } = mongoose;

const ShortUrlSchema = new Schema({
    original_url: {
        type: String,
        required: true,
    },
    short_url: {
        type: Number,
        required: true,
    },
});

module.exports = mongoose.model("ShortUrl", ShortUrlSchema);
