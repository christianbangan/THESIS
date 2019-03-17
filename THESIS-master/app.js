const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./api/routes/users');
const path = require('path');

/*PRODUCTION DATABASE
mongoose.connect(`mongodb://localhost:27017/Box`, (err) => {
    console.log(err);
});
*/

//  TEST DATABASE 
mongoose.connect(`mongodb://localhost:27017/TestBox`, (err) => {
    console.log(err);
});

const app = express();

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, PATCH, GET, POST, DELETE');
        return res.status(200).json({});
    };
    next();
});

app.use(express.static(path.join(__dirname, '/public')));


app.use('/users', userRoutes);

app.use((req, res, next) => {
    var error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        message: error.message
    });
});

module.exports = app;