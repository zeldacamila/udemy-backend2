const User = require('./user.model')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');
const { transporter, welcome } = require('../../utils/mailer');
const { token } = require('morgan');



module.exports = {
/* signup */
  async signup (req, res) {
    try {
      const { fullName, email, password } = req.body

      const encriptedPassord = await bcrypt.hash(password, 11)
      const user = await User.create({ fullName:fullName, email:email, password:encriptedPassord })
      await transporter.sendMail(welcome(user))
      const token  = jwt.sign(
        { id: user._id},
        process.env.SECRET_KEY_JWT,
        { expiresIn: 60 * 60 * 24}//one day
      )
      res.status(201).json({ message: "✅user created", info: { token, email, fullName} })
    } catch (error) {
      console.log(error)
      res.status(400).json({ message: `❌user could NOT be created ${error}`})
    }
  },

  /* login */
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      //validate email
      const user = await User.findOne({ email });console.log()

      if(!user){
        throw new Error(`invalid credentials`)
      }
      //validate password
      //compare 2 arguments 1 password and hashed password
      const isValid = await bcrypt.compare( password, user.password);

      if(!isValid){
        throw new Error(`invalid credentials`)
      }

      const token  = jwt.sign(
        { id: user._id},
        process.env.SECRET_KEY_JWT,
        { expiresIn: 60 * 60 * 24}
      )
      
      res.status(200).json({  message: "✅user logged in", data:{email, token} })

    } catch (error) {
      res.status(400).json(`❌user could not login: ${error}`)
    }
  },
  /* get single user by Id*/
  async showSingleUser(req, res) {
    try {
      const { id } = req.user;
      const user = await User.findById(id);

      if(!user){
        throw new Error("Token expired")
      } 
      res.status(200).json({  message: "✅user found", data:user })

    } catch (error) {
      res.status(400).json({ message: "❌user is not authenticated", data: error })
    }
  },
}
