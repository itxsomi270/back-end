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

// DELETE endpoint to delete a post by its ID
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

// PUT endpoint to update a post by its ID
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
