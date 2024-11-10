const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const multer = require("multer");

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "Hostel";
const signupCollectionName = "signup";
const rentSpaceCollectionName = "rent-your-space";

const storage = multer.memoryStorage();
const upload = multer({ storage });

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db(dbName);
    const signupCollection = database.collection(signupCollectionName);
    const rentSpaceCollection = database.collection(rentSpaceCollectionName);

    // API: User Signup
    app.post("/signup", async (req, res) => {
      const { email, password, ...rest } = req.body;
      try {
        const result = await signupCollection.insertOne({ email, password, ...rest });
        res.status(201).json({ message: "Signup successful!" });
      } catch (error) {
        console.error("Error inserting sign-up data:", error);
        res.status(500).json({ message: "Failed to store signup data", error: error.message });
      }
    });

    // API: User Login
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;
      try {
        const user = await signupCollection.findOne({ email });
        if (!user || password !== user.password) {
          return res.status(401).json({ error: "Invalid email or password" });
        }
        const { password: _, ...userData } = user;
        res.json({ message: "Login successful", user: userData });
      } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
      }
    });

    // API: Add Property
    app.post("/rent-your-space", upload.array("images", 5), async (req, res) => {
      const { title, description, location, price, ownerEmail, bedrooms, bathrooms, entranceType, gas, internet, water, electricity, garage, kitchen } = req.body;
      const images = req.files;

      try {
        const rentalData = {
          title,
          description,
          location,
          price,
          ownerEmail,
          bedrooms,
          bathrooms,
          entranceType,
          gas,
          internet,
          water,
          electricity,
          garage,
          kitchen,
          images: images ? images.map((image) => ({ data: image.buffer, contentType: image.mimetype })) : undefined,
        };

        const result = await rentSpaceCollection.insertOne(rentalData);
        res.status(201).json({ message: "Rental space added!", rentalId: result.insertedId });
      } catch (error) {
        console.error("Error inserting rental data:", error);
        res.status(500).json({ message: "Failed to store rental space data", error: error.message });
      }
    });

    // API: Fetch All Properties
    app.get("/get-properties", async (req, res) => {
      try {
        const properties = await rentSpaceCollection.find().toArray();
        res.status(200).json(properties);
      } catch (error) {
        console.error("Error fetching properties:", error);
        res.status(500).json({ message: "Failed to fetch properties 111", details: error.message });
      }
    });

    // API: Fetch Property by ID
    app.get("/get-property/:id", async (req, res) => {
      try {
        const propertyId = req.params.id;
        const property = await rentSpaceCollection.findOne({ _id: new ObjectId(propertyId) });

        if (property) {
          res.status(200).json(property);
        } else {
          res.status(404).json({ message: "Property not found" });
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        res.status(500).json({ message: "Failed to fetch property", error: error.message });
      }
    });

    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

run().catch(console.dir);
