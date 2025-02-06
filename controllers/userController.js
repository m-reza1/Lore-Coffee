const { Model } = require("sequelize");
const { User, Profile } = require("../models/index");
const bcrypt = require('bcryptjs'); // Import bcryptjs
const accountAuth = require('../middleware/auth');
const user = require("../models/user");

class userController {
    static async registerForm(req, res) {
        try {
            res.render('register')
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    }
    static async saveRegisterForm(req, res) {
        try {
            const { userName, email, password } = req.body

            // console.log(req.body,'<<');
            

            // const salt =  bcrypt.genSaltSync(10);
            // const hashedPassword =  bcrypt.hashSync(password, salt);

            const createUser = await User.create({
                userName,
                email,
                password
            }, { returning: true }
            )

            await Profile.create({
                profileName: 'Blm ada mas',
                phoneNumber: 'masih kosong mas',
                userId: createUser.id
            })
            res.redirect(`/login`)
        } catch (err) {
            console.log(err);
            res.send(err)
            res.status(500).json({ error: err.message });
        }
    }

    static async loginPage(req, res) {
        try {
            res.render('login')
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    }

    static async loggedIn(req, res) {
        try {
            const { userName, password } = req.body

            const user = await User.findOne({
                where: {
                    userName: userName
                }
            });

            // console.log(user);
            
            const isValidPassword = bcrypt.compareSync(password, user.password);

            // console.log(isValidPassword);
            

            if (!isValidPassword) {
                const error = 'Invalid username or password';
                return res.redirect(`/login?error=${error}`);
            }

            req.session.userId = user.id; 
            // console.log(req.session,'<<');

            res.redirect('/');
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    }

    static async home(req, res) {
        try {

            res.render('home')
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    }
    static async menu(req, res) {
        try {

            // res.render('menu')
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    }

    static async cart(req, res) {
        try {
            res.render('cart')
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    }
    static async invoice(req, res) {
        try {
            res.render('invoice')
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    }




    // static async x(req, res) {
    //     try {

    //     } catch (err) {
    //         console.log(err);
    //         res.send(err)
    //     }
    // }
}

module.exports = userController