require("dotenv").config();
const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.TRANSPORT_USERNAME,
        pass: process.env.TRANSPORT_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

var message = {
    from: process.env.TRANSPORT_USERNAME,
    to: "southtestah@gmail.com",
    subject: "Confirmation of Matriculation to Yale.",
};

transporter.sendMail(message);
