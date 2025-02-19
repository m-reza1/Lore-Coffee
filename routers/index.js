const express = require('express')
const router = require('express').Router()
const userController = require('../controllers/userController')
const adminController = require('../controllers/adminController')
const accountAuth = require('../middleware/auth')

// REGISTER
router.get("/register", userController.registerForm)
router.post("/register", userController.saveRegisterForm)

// LOGIN
router.get("/login", userController.loginPage)
router.post("/login", userController.loggedIn)

// LOGOUT
router.get("/logout", userController.logout)

// USER
router.get('/', userController.home) //home
router.get('/menu', userController.menu)// show all item
// router.get('/menu', userController.menu)// show all item

// router.use(accountAuth)
router.post('/add-to-order', userController.addToOrder);
router.post('/update-quantity', userController.updateQuantity);
router.post('/remove-from-order', userController.removeFromOrder);
router.get('/order', userController.order);
// router.get('/invoice', userController.invoice) // invoice
// router.get('/menu', userController.menu)// show all item
// router.get('/invoice', userController.invoice) // invoice
// router.get('/profile')

//test order dan checkout

router.get('/checkout', userController.checkout);

router.post('/checkout', userController.checkout);

router.post('/order', userController.checkout); // Proses checkout
router.post('/send-invoice-email', userController.sendInvoiceEmail);
router.get('/invoice', accountAuth, userController.invoice); // Tampilkan invoice

// ADMIN
// router.get('/', adminController.X);
// router.get('/menu', adminController.getMenu);
// router.get('/profile', adminController.showProfile);
// router.get('/', adminController.X);
// router.get('/', adminController.X);
// router.get('/', adminController.X);
// router.get('/', adminController.X);
// router.get('/', adminController.X);
router.get('/home/admin', adminController.homeAdmin);
router.get('/menu/admin', adminController.getAdminMenu);
router.get('/profile', adminController.getProfile);
router.get('/menu/add', adminController.showAdminAddMenu);
router.post('/menu/add', adminController.saveAdminAddMenu);
router.get('/profile/edit/:id', adminController.showEditProfile);
router.post('/profile/edit/:id', adminController.saveEditProfile);
router.get('/menu/edit/:id', adminController.showAdminEditMenu);
router.post('/menu/edit/:id', adminController.saveAdminEditMenu);
router.get('/menu/delete/:id', adminController.deleteAdminOneMenu);

module.exports = router