const nodemailer = require("nodemailer");
const asyncHandler = require ('express-async-handler');

const sendEmail = asyncHandler(async (data, req, res) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
      });
      
      // async..await is not allowed in global scope, must use a wrapper
      
        // send mail with defined transport object
        const info = await transporter.sendMail({
          from: '"Heyya 👻" <foo@gmail.com>', // sender address
          to: data.to, // list of receivers
          subject: data.subject, // Subject line
          text: data.text, // plain text body
          html: data.html, // html body
        });
      
        console.log("Message sent: %s", info.messageId);
})

module.exports = sendEmail;