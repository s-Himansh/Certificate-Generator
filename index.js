const mongoose = require('mongoose');
const express = require('express');
const routes = require('./routes/route');
const config = require('./config/config');

const app = express();

mongoose.connect(url)
.then(() => {
    console.log("connected to database");
})
.catch((error) => {
    console.log(error);
})


app.use('/', routes);

app.listen(config.PORT, (req, res) => {
    console.log('app is listening at 8002');
})
