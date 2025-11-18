const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db("book-Shope-AppDB");
     const usersCollection = db.collection("users");











    // Test Route
    app.get("/", (req, res) => {
      res.send("storage-management-system Server Running");
    });

    

    await client.db("admin").command({ ping: 1 });
    console.log("🚀 MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Error:", error);
  }
}
run().catch(console.dir);

// Start Server
app.listen(process.env.PORT, () => {
  console.log(`🔥 Server Running on Port: ${process.env.PORT}`);
});
