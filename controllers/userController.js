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

    static async logout(req, res) {
        try {
            req.session.destroy()
            res.redirect('/')
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

    static async checkout(req, res) {
        try {
            // Ambil data order dari session
            const order = req.session.order || [];

            if (order.length === 0) {
                return res.status(400).send("Keranjang belanja kosong");
            }

            // Simpan invoice ke database
            const newInvoice = await Invoice.create({
                userId: req.session.userId, // Pastikan user sudah login
                total: order.reduce((sum, item) => sum + item.price * item.qty, 0),
                status: "Paid"
            });

            // Simpan order sementara ke session agar bisa ditampilkan di invoice
            req.session.lastOrder = req.session.order; // Simpan order sebelum dihapus
            req.session.order = []; // Kosongkan keranjang belanja setelah checkout

            // Redirect ke halaman invoice
            res.redirect(`/invoice?id=${newInvoice.id}`);
        } catch (err) {
            console.log(err);
            res.send(err);
        }
    }

    static async invoice(req, res) {
        try {
            const invoiceId = req.query.id; // Ambil ID invoice dari query parameter
            // ====================================================================
            const userId = req.session.userId;

            // Dapatkan nama profil pengguna
            const profile = await Profile.findOne({ where: { userId } });
            const profileName = profile.profileName;

            // Tanggal saat ini
            const now = new Date();
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = now.toLocaleDateString('en-US', options);

            // Generate kode invoice
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const datePart = `${year}${month}${day}`;

            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const timePart = `${hours}${minutes}${seconds}`;

            let categoryLetter = 'A'; // Default
            const orderItems = req.session.order || [];
            if (orderItems.length > 0) {
                const firstItemId = orderItems[0].id;
                const firstItem = await Item.findByPk(firstItemId, {
                    include: Category
                });
                if (firstItem && firstItem.Category) {
                    categoryLetter = firstItem.Category.categoryName.charAt(0).toUpperCase();
                }
            }
            const invoiceCode = `${datePart}-${categoryLetter}-${timePart}`;


            // Buat entri Invoice untuk setiap item
            for (const item of orderItems) {
                await Invoice.create({
                    code: invoiceCode,
                    quantity: item.quantity,
                    itemId: item.id,
                    userId: userId
                });
            }
            // ====================================================================

            const invoice = await Invoice.findByPk(invoiceId, {
                include: [{
                    model: User,
                    include: [Profile] // Jika ingin menampilkan data profil pengguna
                }]
            });

            if (!invoice) {
                return res.status(404).send('Invoice not found');
            }

            // Ambil data pesanan dari session atau database (jika disimpan)
            const order = req.session.lastOrder || [];

            const total = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            res.render('invoice', {
                profileName,
                date: formattedDate,
                invoiceCode,
                orderItems,
                order,
                total,
                formatRupiah
            });
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