const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors({ origin: 'http://localhost:3000' }));

mongoose.connect('mongodb://127.0.0.1:27017/posts', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(error => {
  console.error('MongoDB connection error:', error);
});

const postSchema = mongoose.Schema({
  content: {
    type: String,
    required: true
  },
});

const Post = mongoose.model('Post', postSchema);

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

const User = mongoose.model('User', userSchema);

app.post('/register', async (req, res) => {
  try {
    const userData = req.body;
    console.log('Received user data:', userData);
    
    const newUser = new User(userData);
    await newUser.save();

    console.log('User registered successfully');
    res.status(200).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error processing registration:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, password });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    console.log('User logged in successfully');
    res.status(200).json({ message: 'User logged in successfully', user });
  } catch (error) {
    console.error('Error processing login:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/posts', async (req, res) => {
  try {
    const postData = req.body;
    console.log('Received post data:', postData);
    
    const newPost = new Post(postData);
    await newPost.save();

    console.log('Data saved to MongoDB');
    res.status(200).json({ message: 'Post created successfully' });
  } catch (error) {
    console.error('Error processing request:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/posts', async (req, res) => {
  try {
    const postDataArray = await Post.find({});
    res.status(200).json(postDataArray);
  } catch (error) {
    console.error('Error reading from MongoDB:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const updatedData = req.body;

    const updatedPost = await Post.findByIdAndUpdate(postId, updatedData, { new: true });

    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.status(200).json({ message: 'Post updated successfully', updatedPost });
  } catch (error) {
    console.error('Error updating post:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
