const express = require('express')
const app = express()
const router =  require('express').Router()
const userController = require('../controllers/userController')

// REGISTER
router.get("/register", userController.registerForm)
router.post("/register", userController.saveRegisterForm)

// LOGIN
router.get("/login", userController.loginPage)
router.post("/login", userController.loginPage)



// =============
router.get('/')

module.exports = router