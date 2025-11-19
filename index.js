const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
});

async function run() {
  try {
    const db = client.db("storage-managementDB");

    const usersCollection = db.collection("users");
    const imagesCollection = db.collection("images");
    const pdfsCollection = db.collection("pdfs");
    const notesCollection = db.collection("notes");
    const foldersCollection = db.collection("folders");

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



   // ================= UPLOAD FILES =================
app.post("/upload/image", async (req, res) => {
  try {
    const { name, size, uid, email } = req.body; // ✨ email add
    const result = await imagesCollection.insertOne({ name, size, uid, email, date: new Date() });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/upload/pdf", async (req, res) => {
  try {
    const { name, size, uid, email } = req.body;
    const result = await pdfsCollection.insertOne({ name, size, uid, email, date: new Date() });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/upload/note", async (req, res) => {
  try {
    const { name, size, uid, email } = req.body;
    const result = await notesCollection.insertOne({ name, size, uid, email, date: new Date() });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/upload/folder", async (req, res) => {
  try {
    const { name, uid, email } = req.body;
    const result = await foldersCollection.insertOne({ name, uid, email, date: new Date() });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ================= GET FILES =================
//  Fetch only current user files using email
app.get("/images/:email", async (req, res) => {
  const { email } = req.params;
  const data = await imagesCollection.find({ email }).toArray();
  res.json(data);
});

app.get("/pdfs/:email", async (req, res) => {
  const { email } = req.params;
  const data = await pdfsCollection.find({ email }).toArray();
  res.json(data);
});

app.get("/notes/:email", async (req, res) => {
  const { email } = req.params;
  const data = await notesCollection.find({ email }).toArray();
  res.json(data);
});

app.get("/folders/:email", async (req, res) => {
  const { email } = req.params;
  const data = await foldersCollection.find({ email }).toArray();
  res.json(data);
});





// Images
app.get("/images/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const data = await imagesCollection.find({ email }).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// PDF
app.get("/pdfs/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const data = await pdfsCollection.find({ email }).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Notes
app.get("/notes/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const data = await notesCollection.find({ email }).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Folders
app.get("/folders/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const data = await foldersCollection.find({ email }).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});



// Rename route
app.put("/rename/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;
    const { newName } = req.body;
    const email = req.body.email; 

    let collection;
    switch (type) {
      case "image": collection = imagesCollection; break;
      case "pdf": collection = pdfsCollection; break;
      case "note": collection = notesCollection; break;
      case "folder": collection = foldersCollection; break;
      default: return res.status(400).json({ message: "Invalid type" });
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id), email }, 
      { $set: { name: newName } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "File not found or unauthorized" });
    }

    res.status(200).json({ message: "File renamed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


// DELETE /delete/:type/:id
app.delete("/delete/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    let collectionName;
    switch (type) {
      case "image":
        collectionName = "images";
        break;
      case "pdf":
        collectionName = "pdfs";
        break;
      case "note":
        collectionName = "notes";
        break;
      case "folder":
        collectionName = "folders";
        break;
      default:
        return res.status(400).json({ message: "Invalid type" });
    }

    const collection = db.collection(collectionName);

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle favorite status
app.patch("/:type/:id/favorite", async (req, res) => {
  try {
    const { type, id } = req.params;
    const { favorite, email } = req.body;

    let collection;
    switch (type) {
      case "image": collection = imagesCollection; break;
      case "pdf": collection = pdfsCollection; break;
      case "note": collection = notesCollection; break;
      case "folder": collection = foldersCollection; break;
      default: return res.status(400).json({ message: "Invalid type" });
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(id), email },
      { $set: { favorite } }
    );

    if (result.matchedCount === 0)
      return res.status(404).json({ message: "File not found or unauthorized" });

    res.status(200).json({ message: "Favorite updated", favorite });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
/// Get all favorite items of a user
app.get("/favorites/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const images = await imagesCollection.find({ email, favorite: true }).toArray();
    const pdfs = await pdfsCollection.find({ email, favorite: true }).toArray();
    const notes = await notesCollection.find({ email, favorite: true }).toArray();
    const folders = await foldersCollection.find({ email, favorite: true }).toArray();

    const favorites = [
      ...images.map(i => ({ ...i, type: "image" })),
      ...pdfs.map(p => ({ ...p, type: "pdf" })),
      ...notes.map(n => ({ ...n, type: "note" })),
      ...folders.map(f => ({ ...f, type: "folder" })),
    ];

    res.json(favorites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


    // ================= TEST =================
    app.get("/", (req, res) => {
      res.send("Storage-management-system Server Running");
    });

    await client.db("admin").command({ ping: 1 });
    console.log("🚀 MongoDB Connected Successfully!");
  } catch (error) {
    console.error("❌ MongoDB Error:", error);
  }
}
run().catch(console.dir);

app.listen(process.env.PORT, () => {
  console.log(`🔥 Server Running on Port: ${process.env.PORT}`);
});
