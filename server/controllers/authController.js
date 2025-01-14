const User = require('../models/User');
const Token = require('../models/Token');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser , sendVerificationEmail} = require('../utils');
const crypto = require('crypto')



const register = async (req, res) => {
  const { email, name, password } = req.body;

  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new CustomError.BadRequestError('Email already exists');
  }

  // first registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const verificationToken = crypto.randomBytes(45).toString('hex');
  const user = await User.create({ name, email, password, role ,verificationToken});
  const origin = 'http://localhost:3000'
  await sendVerificationEmail({name:user.name , email:user.email , verificationToken : user.verificationToken , origin   }); 
  //send verificatio token back when testing in postman 
  res.status(StatusCodes.CREATED).json({msg: 'Success please check your email to verify account '})
  
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};


//Login controller 

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  if(!user.isVerified){
    throw new CustomError.UnauthenticatedError('please verify email ')
  }
  const tokenUser = createTokenUser(user);

  //create refresh token 
  let refreshToken = '';

  //check for existing user 

  refreshToken = crypto.randomBytes(40).toString('hex');
  const userAgent = req.headers['user-agent '];
  const ip = req.ip ;
  const userToken = {refreshToken, ip , userAgent, user:user._id};
 await Token.create(userToken);
 attachCookiesToResponse({res, user:tokenUser , refreshToken})

 /*  attachCookiesToResponse({ res, user: tokenUser }); */

  res.status(StatusCodes.OK).json({ user: tokenUser  });
};

/* verify email  */
const verifyEmail =async  (req, res ) =>{
  const {verificationToken , email } = req.body ; 
  const user = await User.findOne({ email });

  if(!user){
    throw new CustomError.UnauthenticatedError('failed to verify ');
  
  }
  if(user.verificationToken !==verificationToken ) {
 throw new CustomError.UnauthenticatedError('your are a bitch  ');
  }
 
 user.isVerified = true , 
 user.verified = Date.now()
 user.verificationToken =''

  await user.save();


res.status(StatusCodes.OK).json({msg: "email is verified successfully "}) 

}

const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1000),
  });
  res.status(StatusCodes.OK).json({ msg: 'user logged out!' });
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail
};
