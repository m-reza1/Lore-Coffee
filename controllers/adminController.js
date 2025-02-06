const {
    Category,
    Invoice,
    Item,
    Profile,
    User
} = require('../models/index.js')

class adminController {

    static async getMenu(req, res) {
        try {
            let menus = await Item.findAll({
                order: [['itemName', 'ASC']]
            })

            res.render("menu", { menus });
        } catch (err) {
            console.log(err);

            res.send(err)
        }
    }

    static async showProfile(req, res) {
        try {
            let profiles = await Profile.findAll({
                include: User
            });

            res.render("profile", { profiles });
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    }

    static async X(req, res) {
        try {
            res.send('X NOT YET')
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    }

}

module.exports = adminController