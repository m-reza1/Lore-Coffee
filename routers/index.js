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



// =============
router.get('/', adminController.X);
router.get('/menu', adminController.getMenu);
router.get('/profile', adminController.showProfile);
router.get('/', adminController.X);
router.get('/', adminController.X);
router.get('/', adminController.X);
router.get('/', adminController.X);

module.exports = router