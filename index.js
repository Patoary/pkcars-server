const express = require('express');
const cors = require('cors');

require('dotenv').config();
const port = process.env.PORT || 4000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());


app.get('/', (req, res) =>{
    res.send('pkcars connected');
});

app.listen(port, () =>{
    console.log(`pkcars on port ${port}`);
});
