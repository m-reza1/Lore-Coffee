const { formatRupiah } = require('../helpers/helper.js');

const {
    Category,
    Invoice,
    Item,
    Profile,
    User
} = require('../models/index.js')

const { Op } = require("sequelize");

class adminController {

    static async getAdminMenu(req, res) {
        try {
            const { itemName, categoryName } = req.query;

            let options = {
                where: {},
                include: {
                    model: Category,
                    attributes: ['categoryName'],
                },
                order: [['itemName', 'ASC']]
            };

            // SEARCH: Filter berdasarkan nama item
            if (itemName) {
                options.where.itemName = {
                    [Op.iLike]: `%${itemName}%`
                };
            }

            // FILTER: Filter berdasarkan kategori
            if (categoryName) {
                options.include = [{
                    model: Category,
                    attributes: ['categoryName'],
                    where: { categoryName }
                }];
            }

            // Ambil data menu
            let menus = await Item.findAll(options);

            // Ambil semua kategori untuk ditampilkan di filter
            let categories = await Category.findAll();

            res.render("adminMenu", { menus, categories, formatRupiah });
        } catch (err) {
            console.log(err);
            res.send(err);
        }
    }


    static async getAdminProfile(req, res) {
        try {
            let profiles = await Profile.findAll({
                include: User
            });

            res.render("adminProfile", { profiles });
        } catch (err) {
            console.log(err);

            res.send(err)
        }
    }

    static async showAdminAddMenu(req, res) {
        try {
            let categories = await Category.findAll();

            res.render('adminAddMenu', {
                menus: {},
                categories
            });
        } catch (err) {
            console.log(err);

            res.send(err);
        }
    }

    static async saveAdminAddMenu(req, res) {
        try {
            const { itemName, price, description, categoryId, imageURL } = req.body;

            await Item.create({
                itemName,
                price,
                description,
                categoryId,
                imageURL
            });

            res.redirect("/menu");
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    }

    static async showAdminEditMenu(req, res) {
        try {
            const { id } = req.params;

            let menus = await Item.findByPk(+id);

            let categories = await Category.findAll();

            res.render('adminEditMenu', { menus, categories });
        } catch (err) {
            console.log(err);
            res.send(err);
        }
    }

    static async saveAdminEditMenu(req, res) {
        try {
            const { id } = req.params;

            const { itemName, price, description, categoryId, imageURL } = req.body;

            await Item.update(
                {
                    itemName,
                    price,
                    description,
                    categoryId,
                    imageURL
                },
                {
                    where: { id: +id }
                }
            );

            res.redirect("/menu");
        } catch (err) {
            console.log(err);

            res.send(err);
        }
    }

    static async deleteAdminOneMenu(req, res) {
        try {
            const { id } = req.params;

            await Item.findByPk(+id);

            await Item.destroy({
                where: {
                    id: +id
                }
            })

            res.redirect('/menu')
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    }

    static async showAdminEditProfile(req, res) {
        try {
            const { id } = req.params;

            let profile = await Profile.findByPk(+id, {
                include: User
            });

            res.render('adminEditProfile', {
                profiles: profile,
                users: profile.User
            });
        } catch (err) {
            console.log(err);

            res.send(err);
        }
    }

    static async saveAdminEditProfile(req, res) {
        try {
            const { id } = req.params;

            const { userName, email, password, profileName, phoneNumber } = req.body;

            // Temukan user berdasarkan id
            const user = await User.findOne({
                where: { id: +id },
                include: [{ model: Profile }] 
            });


            // Update user data
            await User.update(
                { userName, email, password },
                { where: { id: +id } }
            );

            // Update profile data
            await Profile.update(
                { profileName, phoneNumber },
                { where: { id: user.Profile.id } } 
            );

            res.redirect("/profile");
        } catch (err) {
            console.log(err);
            res.status(500).send(err);
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