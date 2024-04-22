const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

app.post('/posts', (req, res) => {
  try {
    const postData = req.body;
    console.log('Received post data:', req.body);
    res.send('req recieved')
  }

  catch (error) {
    console.log(error.message)
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
