const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors')

const checkRoutes = require('./routes/check')

var app = express();
app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))
app.use(bodyParser.json({ limit: "50mb" }));

app.use(checkRoutes)