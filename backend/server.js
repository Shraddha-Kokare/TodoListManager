const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const taskRoutes = require("./routes/taskRoutes");

const app = express();
const PORT = 5000;

// Hardcoded MongoDB Atlas connection string as requested.
const MONGO_URI =
  "mongodb+srv://kokareshraddha5_db_user:kokareshraddha5_db_user@cluster0.lfuppzw.mongodb.net/?appName=Cluster0";

// Middleware configuration.
app.use(cors());
app.use(express.json());

// API route setup.
app.use("/tasks", taskRoutes);

// Health route to quickly check server status.
app.get("/", (req, res) => {
  res.send("To-Do List Manager API is running");
});

// Connect to MongoDB Atlas, then start backend server.
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas");
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });
