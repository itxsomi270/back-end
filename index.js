const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors'); 
// Removed bcrypt and jwt imports as they are no longer needed
const app = express();
const port = 4000;

app.use(express.json());
app.use(cors());

const uri = 'mongodb://localhost:27017'; 
const client = new MongoClient(uri);
const dbName = 'Hostel';
const collectionName = 'signup';

async function run() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // Route to handle POST requests to /signup
        app.post('/signup', async (req, res) => {
            console.log("Sign-up request received");
            const { email, password, ...rest } = req.body;

            try {
                // Insert data into MongoDB collection without password hashing
                const result = await collection.insertOne({ email, password, ...rest });
                console.log(`Data inserted with _id: ${result.insertedId}`);

                res.status(201).json({ 
                    message: 'Sign-up data received and stored successfully!' 
                });
            } catch (error) {
                console.error('Error inserting data into MongoDB', error);
                res.status(500).json({ message: 'Failed to store data in MongoDB' });
            }
        });

        // Route to handle POST requests to /login
        app.post('/login', async (req, res) => {
            console.log("Login request received");
            const { email, password } = req.body;

            try {
                // Find user by email
                const user = await collection.findOne({ email });

                if (!user) {
                    console.log(`User with email ${email} not found`);
                    return res.status(401).json({ error: 'Invalid email or password' });
                }

                // Compare provided password with the one in the database
                if (password !== user.password) {
                    console.log('Password does not match');
                    return res.status(401).json({ error: 'Invalid email or password' });
                }

                // Return user data excluding the password
                const { password: _, ...userData } = user; // Exclude password from response
                res.json({ 
                    message: 'Login successful',
                    user: userData 
                });
            } catch (error) {
                console.error('Error logging in:', error);
                res.status(500).json({ error: 'Internal server error' });
            }
        });

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
    }
}

run().catch(console.dir);
