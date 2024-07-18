const nodemailer = require("nodemailer");
const nodeMailerConfig = require('./nodeMailerConfig')
const sendEmail = async({to , subject , html })=>{
    const testAccount = nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport(nodeMailerConfig);

     return transporter.sendMail({
        from: '"loulaaa 👻" <houdabnklf@gmail.com>', // sender address
         to , 
         subject , 
         html , 
      });
}
module.exports =sendEmail ; 