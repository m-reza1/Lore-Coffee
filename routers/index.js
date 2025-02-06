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
router.get('/', userController.home) //home
router.get('/invoice', userController.invoice) // invoice
router.get('/cart', userController.cart) // invoice
// router.get('/menu',userController.menu)// show all item
// router.get('/invoice', userController.invoice) // invoice
// router.get('/profile')

module.exports = router