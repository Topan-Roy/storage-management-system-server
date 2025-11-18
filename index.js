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
    const db = client.db("storage-managementDB");
     const usersCollection = db.collection("users");

 // ✅ Registration API
app.post("/users", async (req, res) => {
  const { uid, username, email, role } = req.body;

  if (!uid || !username || !email) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const result = await usersCollection.insertOne({
      uid,
      username,
      email,
      role: role || "user",
      createdAt: new Date(),
    });

    res.status(201).json(result); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
    
    // Get all users (admin purpose)
    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

 // 🔹 Get all users (admin purpose)
    app.get("/users", async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();
        res.json({ success: true, users });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });

    // 🔹 Get user by uid
    app.get("/users/:uid", async (req, res) => {
      const { uid } = req.params;
      try {
        const user = await usersCollection.findOne({ uid });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        res.json({ success: true, user });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
      }
    });







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
