const { Model, Op } = require("sequelize");
const { User, Profile, Category, Item, Invoice } = require("../models/index");
const bcrypt = require('bcryptjs'); // Import bcryptjs
const accountAuth = require('../middleware/auth');
const user = require("../models/user");
const { formatRupiah } = require('../helpers/helper.js');

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

            const toast = req.session.toast;
            delete req.session.toast;

            res.render("userMenu", {
                menus,
                categories,
                formatRupiah,
                toast
            });
        } catch (err) {
            console.log(err);
            res.send(err)
        }
    }

    static async addToOrder(req, res) {
        try {
            const { itemId } = req.body;
            const item = await Item.findByPk(itemId);

            if (!req.session.order) {
                req.session.order = [];
            }

            const existingItem = req.session.order.find(i => i.id === item.id);

            if (existingItem) {
                existingItem.quantity++;
            } else {
                req.session.order.push({
                    id: item.id,
                    itemName: item.itemName,
                    price: item.price,
                    imageURL: item.imageURL,
                    quantity: 1
                });
            }

            // Set session untuk toast
            req.session.toast = {
                type: 'success',
                message: 'Item berhasil ditambahkan ke keranjang'
            };

            res.redirect('/menu');
        } catch (err) {
            console.log(err);
            req.session.toast = {
                type: 'danger',
                message: 'Gagal menambahkan item'
            };
            res.redirect('/menu');
        }
    }

    static async updateQuantity(req, res) {
        try {
            const { itemId, action } = req.body;

            const item = req.session.order.find(i => i.id === Number(itemId));

            if (action === 'increase') {
                item.quantity++;
            } else if (action === 'decrease') {
                item.quantity--;
                if (item.quantity <= 0) {
                    req.session.order = req.session.order.filter(i => i.id !== Number(itemId));
                }
            }

            res.redirect('/order');
        } catch (err) {
            console.log(err);
            res.send(err);
        }
    }

    static async removeFromOrder(req, res) {
        try {
            const { itemId } = req.body;
            req.session.order = req.session.order.filter(i => i.id !== Number(itemId));

            req.session.toast = {
                type: 'danger',
                message: 'Item berhasil dihapus dari keranjang'
            };

            res.redirect('/order');
        } catch (err) {
            console.log(err);
            res.send(err);
        }
    }

    static async order(req, res) {
        try {
            const order = req.session.order || [];
            const total = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const toast = req.session.toast;
            delete req.session.toast;

            res.render('order', {
                order,
                total,
                formatRupiah,
                toast
            });
        } catch (err) {
            console.log(err);
            res.send(err);
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