const Users = require('../../models/users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Tokens = require('../../models/tokens');
//const fs = require('fs');
const path = require('path');



//CONTROL FOR USER LOGIN
exports.login_user = (req, res, next) => {
    // res.status(200).json({
    //     message: 'Workingggg'
    // });
    Users.findOne({ email: req.body.email }).exec().then((result) => {
        if (!result) {      
            return res.status(401).json({
                message: 'Access failed'
            })
        }
        bcrypt.compare(req.body.password, result.password, (err, response) => {
            const token = jwt.sign({
                email: result.email,
                userId: result._id
            }, process.env.JWT_KEY, {
                    //expiresIn: "1hr"
                });
            if (response) {
                res.status(200).json({
                    token: token,
                    message: 'Authentication success'
                });
                // console.log('Body', req.body.email);
                // console.log('Query', req.query.email);

                //return res.sendFile(path.join(__dirname + '../../../home.html'));
            } else {
                res.status(401).json({
                    message: 'Authentication failed'
                });
            }
        });
    }).catch((err) => {
        res.status(400).json({
            message: err
        })
    });
}

//CONTROL FOR USER REGISTER
exports.register_user = (req, res, next) => {
    Users.find({ email: req.body.email }).exec().then((result) => {
        if (result.length > 0) {
            return res.status(401).json({
                message: 'Email already exists'
            });
        }
        bcrypt.hash(req.body.password, 10, (err, encrypted) => {
            if (err) {
                res.status(401).json({
                    message: err
                })
            } else {
                var user = new Users({
                    _id: mongoose.Types.ObjectId(),
                    email: req.body.email,
                    password: encrypted
                });
                user.save().then((result) => {
                    res.status(200).json({
                        message: 'Registered successfully'
                    });
                    console.log(result);
                }).catch((err) => {
                    res.status(403).json({
                        message: err
                    });
                });
            }
        });
    }).catch((err) => {
        res.status(400).json({
            message: err
        });
    });
}

//CONTROL FOR FORGOT PASSWORD
exports.forgot_password = (req, res, next) => {
    // res.status(200).json({
    //     message: 'okay'
    // })
    Users.find({email: req.body.email}).exec().then((result) => {
        
        if (result.length > 0) {
            const token = jwt.sign({
                email: result[0].email,
                userId: result[0]._id
            }, process.env.JWT_KEY, {
                expiresIn: "1hr"
            });
            console.log(token);
            Tokens.create({
                _id: mongoose.Types.ObjectId(),
                token: token,
                email: result[0].email
            });
            try {
                let transporter = nodemailer.createTransport({
                    host: process.env.HOST,
                    port: 587,
                    secure: false, // true for 465, false for other ports
                    auth: {
                        user: process.env.EMAIL_ADDRESS, // generated ethereal user
                        pass: process.env.EMAIL_PASSWORD // generated ethereal password
                    },
                    tls: {
                        rejectUnauthorized: false
                    }
                });
                var link = `http://localhost:3000/users/reset_password/${token}`;
                // setup email data with unicode symbols
                let mailOptions = {
                    from: '"AMABOX NOTIFICATION" <no-reply@amaboxemail.com>', // sender address
                    to: "albertchristianbangan@gmail.com", // list of receivers (change it to req.body.email in production)
                    subject: "Password Reset", // Subject line
                    text: "", // plain text body
                    html: `<center><br><img src="https://scontent.fmnl2-1.fna.fbcdn.net/v/t1.15752-9/53435193_1938384942936728_3002229247105302528_n.jpg?_nc_cat=109&_nc_eui2=AeFFV4iX7OAKgDt6vHX2NxwX7h3uybDZwWw7sG2w2LXcYwikEduerc48a97t8TkvG-HKm3NDSA3_olVgB_qOY8VlwEZ_Jw4MPys57LgPaEqPqA&_nc_ht=scontent.fmnl2-1.fna&oh=7e61e2921633220777f488efaa2ef626&oe=5D1FAE20"><br><hr></center><p>Hello, <br><br>You recently requested to reset your password for AMA BOX because you forgot your password.</p><p>To complete the process, please click the link below to reset your password:</p><p><a href="${link}"> CLICK HERE TO RESET YOUR PASSWORD</a></p><br><p>Not you? Please do not click the link.</p><p style="color: red">Note: This link will expire after one(1) hour</p><br><p>Thanks,<br>AMA BOX Development Team</p>` // html body
                };

                // send mail with defined transport object
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(JSON.stringify(error));
                    } else {
                        console.log('Email sent: ' + JSON.stringify(info.res));
                    }
                });

                res.status(200).json({
                    message: 'An email was sent successfully'
                });
            } catch (error) {
                console.log(error);  
            }
        } else {
            res.status(400).json({
                message: 'Email not found'
            });
        }
    }).catch((err) => {
        res.status(400).json({
            message: err
        });
    });
}

exports.reset_password = (req, res, next) => {
    //token: req.params.token
    var token = req.params.token;
    Tokens.findOne({ token: token, status: 'unused' }).exec().then((result) => {
        console.log('Token.findOne:', result);
        if (result === undefined || result === null) {
            res.status(400).json({
                message: 'There is an error'
            });
        }
        else {
            console.log('Bcrypt hash:', req.body.password); 
            bcrypt.hash(req.body.password, 10, (err, enc) => {
                if (!err) {
                    Users.findOneAndUpdate({ email: result.email }, {
                        $set: {
                            password: enc
                        }
                    }).exec().then((result) => {
                        res.status(200).json(result);
                    }).catch((err) => {
                        res.status(400).json(err);
                    });
                    console.log(enc);
                    Tokens.findOneAndUpdate({token: token, status: 'unused'}, {$set: {status: 'used'}}).exec().then((result) => {
                        res.status(200).json(result);
                    }).catch((err) => {
                        res.status(400).json(err);
                    });                    
                } else {
                    console.log('Bcrypt hash Error:', err);
                    res.status(400).json({
                        message: 'There is an error'
                    });
                }
            })
        }
    }).catch((err) => {
        res.status(400).json({
            mesasage: err
        })
    });
}

exports.reset_passwordTemplate = (req, res, next) => {
    var token = req.params.token;
    Tokens.findOne({ token: token, status: 'unused' }).exec().then((result) => {
        console.log('Token.findOne:', result);
        if (result === undefined || result === null) {
            return res.status(400).json({
                message: 'The link is expired/activated'
            });
        }
        res.sendFile(path.join(__dirname + '../../../views/create.html'));
        //res.sendFile(path.join(__dirname + '../../../create.html'));
    //res.send('Your query: ' + req.params.token + '\n');
});
};

exports.getLoginPage = (req, res, next) => {
    res.sendFile(path.join(__dirname + '../../../views/index.html'));
    //res.sendFile(path.join(__dirname + '../../../index.html'));
};

exports.getHomePage = (req, res, next) => {
    //res.sendFile(path.join(__dirname + '../../../home.html'));
    res.sendFile(path.join(__dirname + '../../../views/home.html'));
}