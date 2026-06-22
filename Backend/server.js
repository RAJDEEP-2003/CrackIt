require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const app = require("./src/app")
const connectToDB = require("./src/config/database")

connectToDB()


app.listen(3000, () => {
    console.log("Server is running on port 3000")
})
console.log("GEMINI KEY:", process.env.GOOGLE_GENAI_API_KEY);
