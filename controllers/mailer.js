const nodemailer = require("nodemailer");
require("dotenv").config();
module.exports = {
  sendMail: (name, email, subject, message) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
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
      } else console.log("------------------ sent ", error);
    });
  },
};
