const mongoose = require('mongoose');
const express = require('express');
const routes = require('./routes/route');
const config = require('./config/config');

const app = express();

mongoose.connect('mongodb+srv://sneilhhh:vjBHmzqKtl5HmYqw@cluster0.foa5oyg.mongodb.net/CertificateData?retryWrites=true&w=majority')
.then(() => {
    console.log("connected to database");
})
.catch((error) => {
    console.log(error);
})


app.use('/', routes);

app.listen(config.PORT, (req, res) => {
    console.log('app is listening at 3000');
})
