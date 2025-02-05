const { Model } = require("sequelize");
const { User } = require("../models/index");

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

            console.log(userName, email, password,"<<");

            await User.create({
                userName,
                email,
                password
            })
            
            res.redirect(`/login`)
        } catch (err) {
            console.log(err);
            res.send(err)
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

    // static async home(req, res) {
    //     try {


    //         res.render('/')
    //     } catch (err) {
    //         console.log(err);
    //         res.send(err)
    //     }
    // }




    // static async x(req, res) {
    //     try {

    //     } catch (err) {
    //         console.log(err);
    //         res.send(err)
    //     }
    // }
}

module.exports = userController