const { Model } = require("sequelize");
const { User, Profile } = require("../models/index");
const bcrypt = require('bcryptjs'); // Import bcryptjs
const bodyParser = require('body-parser');


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

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Simpan user ke "database"
            // User.push({ userName, email, password: hashedPassword });

        let createUser = await User.create({
                userName,
                email,
                password: hashedPassword
            }, {returning: true}
        )
        
        await Profile.create({
            profileName: 'Blm ada mas',
            phoneNumber: 'masih kosong mas',
            userId : createUser.id
        })

            res.redirect(`/login`)
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    }

    static async loginPage(req, res) {
        try {
            const { username, password } = req.body

            User.findOne( {
                where: {
                    username
                }
            })

            res.render('login')
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

            res.render('menu')
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