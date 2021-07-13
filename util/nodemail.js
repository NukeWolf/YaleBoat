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

function sendVerificationEmail(email, code) {
    var message = {
        from: process.env.TRANSPORT_USERNAME,
        to: email,
        subject: "Yale 2025 Discord Email Verification.",
        text: `In order to finish the verification proccess, please use the following code/command below. Only send this code to the YaleBoat bot. \n\n Code: ${code} \n\n Command: !verify ${code}`,
    };
    transporter.sendMail(message);
}
module.exports.sendVerificationEmail = sendVerificationEmail;
