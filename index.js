const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

let postDataArray = [];
try {
  const existingData = fs.readFileSync('data.json', 'utf8');
  postDataArray = JSON.parse(existingData);
} catch (err) {
  if (err.code !== 'ENOENT') {
    console.error('Error reading file:', err.message);
  }
}

app.post('/posts', (req, res) => {
  try {
    const postData = req.body;
    console.log('Received post data:', postData);

    // Push the new object to the existing array
    postDataArray.push(postData);

    // Write the updated array to data.json
    fs.writeFile('data.json', JSON.stringify(postDataArray), (err) => {
      if (err) {
        console.error('Error writing to file:', err.message);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      console.log('Data saved to data.json');
      res.status(200).json({ message: 'Request received successfully' });
    });
  } catch (error) {
    console.error('Error processing request:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
