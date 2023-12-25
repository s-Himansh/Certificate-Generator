const mongoose = require('mongoose');

const certSchema = new mongoose.Schema({
    Name : {
        type : String,
        required : true
    },
    Type : {
        type : String,
        required : true
    },
    Email : {
        type : String,
        required : true
    },
    Date : {
        type : Date,
        default : Date.now
    }
})

module.exports = mongoose.model('participant', certSchema);