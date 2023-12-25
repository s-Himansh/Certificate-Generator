const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const xlsx = require('xlsx');
const certController = require('../controller/certController');
const path = require('path');
const session = require('express-session');

const Route = express();

const secret = "thisisnew"
Route.use(session({secret : secret }));
Route.use(express.static('public'));

Route.use(bodyParser.json());
Route.use(bodyParser.urlencoded({extended : true}));

Route.set('view engine', 'ejs');
Route.set('views', './views');


const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // console.log(file.buffer);
    cb(null, true);
  }
});


Route.get('/', certController.loadMain);
Route.post('/', upload.array('file'), certController.extractData);
Route.post('/emailSent', certController.sendEmails);
Route.get('/verify', certController.certficateLoader);



// Route.get('/certificate', (req, res) => {
//     res.render('certificate', {message : {Name : "Himanshu Sharma", Type : "A+", Date : "24/12/2023"}});
// })


module.exports = Route;




