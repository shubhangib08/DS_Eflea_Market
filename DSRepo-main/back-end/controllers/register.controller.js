const db = require("../models");
const User = db.user;

module.exports.register= async (req, res) => {
  const { name, lastName, useName, email, pwd } = req.body
  try {
    if (name && pwd && email) {
      user = new User({ name, lastName, useName, email, pwd })
      await user.save()
      res.status(200).send({
        message: "success",
        data: user,
        error: null
      })
    } else {
      throw new Error("Some error occurred while creating the Product")
    }
  } catch (e) {
    res.status(500).send({
      error: e.message,
      message: "Failed"
    })
  }
 }
module.exports.findUser = async (req, res) => {
  try {
    user = await User.where()
    res.status(200).json({
      message: "success",
      data: user,
      error: null
    })

  } catch (e) {
    res.status(500).json({
      error: e,
      message: "Failed"
    })
  }
}  

