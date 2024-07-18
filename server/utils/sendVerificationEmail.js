const sendEmail = require('./sendEmail');

const sendVerificationEmail = async(
   { name ,
    email , 
    verificationToken , 
    origin,}
     )=>{

    const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`
    const message = `<p>please confirm your email by clicking on the following link : 
    <a href="${verifyEmail} ">verify email bro </a></p>`
    return sendEmail({
        to : email , 
        subject :' email confirmation ' , 
        html : `<h4>hey there  ${name}</h4>
        ${message }`  })

}

module.exports = sendVerificationEmail;