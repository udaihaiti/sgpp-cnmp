const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'udaihaiti@gmail.com',
        pass: 'ylavtyuphrwdjpjj'
    }
});

module.exports = transporter;
