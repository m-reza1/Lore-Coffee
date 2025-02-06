const express = require('express')
const router =  require('express').Router()
const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')
const accountAuth = require('../middleware/auth')

// REGISTER
router.get("/register", userController.registerForm)
router.post("/register", userController.saveRegisterForm)

// LOGIN
router.get("/login", userController.loginPage)
router.post("/login", userController.loggedIn)

// USER
router.get('/', userController.home) //home
router.get('/menu',userController.menu)// show all item

router.use(accountAuth)

router.get('/cart',accountAuth, userController.cart)
// router.get('/invoice', userController.invoice) // invoice
// router.get('/profile')

// ADMIN
// router.get('/', adminController.X);
// router.get('/menu', adminController.getMenu);
// router.get('/profile', adminController.showProfile);
// router.get('/', adminController.X);
// router.get('/', adminController.X);
// router.get('/', adminController.X);
// router.get('/', adminController.X);

module.exports = router