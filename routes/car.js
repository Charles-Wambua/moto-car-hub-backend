const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // perform validation and authentication logic here
  // ...
  // if successful, return a JSON response with a success message and user data
  const user = { username: username, email: 'user@example.com' };
  res.json({ success: true, user });
  // if unsuccessful, return a JSON response with an error message
  // res.status(401).json({ success: false, message: 'Invalid username or password' });
});

app.listen(3001, () => console.log('Server started on port 3001'));
