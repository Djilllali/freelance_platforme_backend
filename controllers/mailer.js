const nodemailer = require("nodemailer");
require("dotenv").config();
module.exports = {
  sendMail: (name, email, subject, message, OnError, OnSuccess) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.123-reg.co.uk",
      port: 465,
      secure:true,
      auth: {
        user: process.env.EMAIL_ADDR,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    console.log(
      "==============auth",
      process.env.EMAIL_ADDR,
      process.env.EMAIL_PASSWORD
    );
    const mailOptions = {
      to: email,
      from: process.env.EMAIL_ADDR,
      subject: subject,
      text: message,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("------------------err ", error);
      } else {
        console.log("------------------ sent ", info);
      }
    });
  },
};
