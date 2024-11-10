const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const multer = require("multer"); 
const { ObjectId } = require('mongodb'); 

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

// MongoDB setup
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
const dbName = "Hostel"; 
const signupCollectionName = "signup"; 
const rentSpaceCollectionName = "rent-your-space"; 

// Configure multer for file handling (using memory storage)
const storage = multer.memoryStorage(); 
const upload = multer({ storage }); 

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db(dbName);
    const signupCollection = database.collection(signupCollectionName);
    const rentSpaceCollection = database.collection(rentSpaceCollectionName);

    // Route to handle POST requests to /signup (user registration)
    app.post("/signup", async (req, res) => {
      const { email, password, ...rest } = req.body;
      try {
        const result = await signupCollection.insertOne({
          email,
          password,
          ...rest,
        });
        res
          .status(201)
          .json({ message: "Sign-up data received and stored successfully!" });
      } catch (error) {
        console.error("Error inserting sign-up data:", error);
        res
          .status(500)
          .json({
            message: "Failed to store sign-up data in MongoDB",
            error: error.message,
          });
      }
    });

    // Route to handle POST requests to /login (user authentication)
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;
      try {
        const user = await signupCollection.findOne({ email });
        if (!user || password !== user.password) {
          return res.status(401).json({ error: "Invalid email or password" });
        }
        const { password: _, ...userData } = user; // Remove the password from the response
        res.json({ message: "Login successful", user: userData });
      } catch (error) {
        console.error("Error logging in:", error);
        res
          .status(500)
          .json({ error: "Internal server error", details: error.message });
      }
    });

    // Route to handle POST requests to /rent-your-space (property listing)
    app.post(
      "/rent-your-space",
      upload.array("images", 5),
      async (req, res) => {
        const {
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
        } = req.body;
        const images = req.files; // This will be an array of uploaded images

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
            images: images
              ? images.map((image) => ({
                  data: image.buffer,
                  contentType: image.mimetype,
                }))
              : undefined, // Save multiple image data to MongoDB
          };

          const result = await rentSpaceCollection.insertOne(rentalData);
          res.status(201).json({
            message: "Rental space data received and stored successfully!",
            rentalId: result.insertedId,
          });
        } catch (error) {
          console.error(
            "Error inserting rental space data into MongoDB:",
            error
          );
          res
            .status(500)
            .json({
              message: "Failed to store rental space data in MongoDB",
              error: error.message,
            });
        }
      }
    );

    // Route to fetch all properties (GET request to /get-properties)
    app.get('/get-property/:id', async (req, res) => {
      try {
        const propertyId = req.params.id;  // Property ID from the URL params
        console.log('Fetching property with ID:', propertyId); // Debug log
    
        // Convert the propertyId to ObjectId
        const property = await rentSpaceCollection.findOne({ _id: new ObjectId(propertyId) });
    
        if (property) {
          res.status(200).json(property);
        } else {
          res.status(404).json({ message: 'Property not found' });
        }
      } catch (error) {
        console.error('Error fetching property:', error);
        res.status(500).json({ message: 'Failed to fetch property', error: error.message });
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
  }
}

// Run the server
run().catch(console.dir);
