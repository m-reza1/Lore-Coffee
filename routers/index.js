const express = require('express')
const router =  require('express').Router()
const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')

// REGISTER
router.get("/register", userController.registerForm)
router.post("/register", userController.saveRegisterForm)

// LOGIN
router.get("/login", userController.loginPage)
router.post("/login", userController.loginPage)


// USER
router.get('/', userController.home) //home
router.get('/invoice', userController.invoice) // invoice
router.get('/cart', userController.cart) // invoice
// router.get('/menu',userController.menu)// show all item
// router.get('/invoice', userController.invoice) // invoice
// router.get('/profile')

// ADMIN
router.get('/', adminController.X);
router.get('/menu', adminController.getMenu);
router.get('/profile', adminController.showProfile);
router.get('/', adminController.X);
router.get('/', adminController.X);
router.get('/', adminController.X);
router.get('/', adminController.X);

module.exports = router