const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const multer = require('multer'); // Middleware for handling file uploads

const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

// MongoDB setup
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'Hostel'; // The database name
const signupCollectionName = 'signup'; // The signup collection name
const rentSpaceCollectionName = 'rent-your-space'; // The rent-your-space collection name

// Configure multer for file handling (using memory storage)
const storage = multer.memoryStorage(); // Store files in memory for easy access
const upload = multer({ storage }); // Configure multer to use memory storage

async function run() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB');

        const database = client.db(dbName);
        const signupCollection = database.collection(signupCollectionName);
        const rentSpaceCollection = database.collection(rentSpaceCollectionName);

        // Route to handle POST requests to /signup (user registration)
        app.post('/signup', async (req, res) => {
            const { email, password, ...rest } = req.body;
            try {
                const result = await signupCollection.insertOne({ email, password, ...rest });
                res.status(201).json({ message: 'Sign-up data received and stored successfully!' });
            } catch (error) {
                console.error('Error inserting sign-up data:', error);
                res.status(500).json({ message: 'Failed to store sign-up data in MongoDB', error: error.message });
            }
        });

        // Route to handle POST requests to /login (user authentication)
        app.post('/login', async (req, res) => {
            const { email, password } = req.body;
            try {
                const user = await signupCollection.findOne({ email });
                if (!user || password !== user.password) {
                    return res.status(401).json({ error: 'Invalid email or password' });
                }
                const { password: _, ...userData } = user; // Remove the password from the response
                res.json({ message: 'Login successful', user: userData });
            } catch (error) {
                console.error('Error logging in:', error);
                res.status(500).json({ error: 'Internal server error', details: error.message });
            }
        });

        // Route to handle POST requests to /rent-your-space (property listing)
        app.post('/rent-your-space', upload.single('image'), async (req, res) => {
            const { title, description, location, price, ownerEmail } = req.body;
            const image = req.file; // Multer stores the file in req.file
            
            try {
                const rentalData = {
                    title,
                    description,
                    location,
                    price,
                    ownerEmail,
                    image: image ? { data: image.buffer, contentType: image.mimetype } : undefined, // Save image data to MongoDB
                };
        
                const result = await rentSpaceCollection.insertOne(rentalData);
                res.status(201).json({
                    message: 'Rental space data received and stored successfully!',
                    rentalId: result.insertedId
                });
            } catch (error) {
                console.error('Error inserting rental space data into MongoDB:', error);  // Log the full error message
                res.status(500).json({ message: 'Failed to store rental space data in MongoDB', error: error.message });
            }
        });
        

        // Route to fetch all properties (GET request to /get-properties)
        app.get('/get-properties', async (req, res) => {
            try {
                const properties = await rentSpaceCollection.find().toArray();
                res.status(200).json(properties);
            } catch (error) {
                console.error('Error fetching properties:', error);
                res.status(500).json({ message: 'Failed to fetch properties from MongoDB', details: error.message });
            }
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
}

// Run the server
run().catch(console.dir);
