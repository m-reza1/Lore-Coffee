const { Model, Op } = require("sequelize");
const { User, Profile, Category, Item, Invoice } = require("../models/index");
const bcrypt = require('bcryptjs'); // Import bcryptjs
const accountAuth = require('../middleware/auth');
const user = require("../models/user");
const { formatRupiah } = require('../helpers/helper.js');
const nodemailer = require("nodemailer");

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
            }, { returning: true });

            await Profile.create({
                profileName: 'Your Name',
                phoneNumber: '+',
                userId: createUser.id
            });

            res.redirect('/login');
        } catch (err) {
            let errors = [];

            // Handle Sequelize validation errors
            if (err.name === 'SequelizeValidationError') {
                errors = err.errors.map(e => e.message);
            }
            // Handle unique constraint errors
            else if (err.name === 'SequelizeUniqueConstraintError') {
                err.errors.forEach(e => {
                    if (e.path === 'userName') errors.push('Username already exists');
                    if (e.path === 'email') errors.push('Email already registered');
                });
            }
            // Handle other errors
            else {
                errors.push('Registration failed. Please try again.');
            }

            res.render('register', {
                errors,
                oldInput: req.body // Untuk mempertahankan input yang sudah dimasukkan
            });
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


            if (itemName) {
                options.where.itemName = {
                    [Op.iLike]: `%${itemName}%`
                };
            }

            if (categoryName) {
                options.include = [{
                    model: Category,
                    attributes: ['categoryName'],
                    where: { categoryName }
                }];
            }

            let menus = await Item.findAll(options);

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

            // console.log(order, 'order<<');
            

        } catch (err) {
            console.log(err);
            res.send(err);
        }
    }
    static async checkout(req, res) {
        try {
            // console.log('sampe sini>>><<<');
            
            const order = req.session.order || [];
            
            if (order.length === 0) {
                return res.status(400).send("Keranjang belanja kosong");
            }
            
            const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);
            
            // Generate kode invoice
            const now = new Date();
            const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
            const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '');
            
            let categoryLetter = 'A';
            
            if (order.length > 0) {
                const firstItem = await Item.findByPk(order[0].id, { include: Category });
                if (firstItem?.Category) {
                    categoryLetter = firstItem.Category.categoryName.charAt(0).toUpperCase();
                }
            }
            const invoiceCode = `${datePart}-${categoryLetter}-${timePart}`;

            const newInvoice = await Invoice.create({
                userId: req.session.userId,
                code: invoiceCode,
                total: total,
                status: "Paid"
            });

            console.log(`Invoice created:`, newInvoice);

            req.session.lastOrder = order;
            req.session.order = [];

            const transporter = nodemailer.createTransport({
                service: "Gmail",
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                  user: "mrejaa@gmail.com",
                  pass: "fpuxqhasttkdgzly",
                },
              });

              // app pass : fpux qhas ttkd gzly

              const mailOptions = {
                from: "mrejaa@gmail.com",
                to: "anawawim@gmail.com", // <<
                subject: "Hello from Nodemailer",
                text: "This is a test email sent using Nodemailer.",
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error("Error sending email: ", error);
                } else {
                  console.log("Email sent: ", info.response);
                }
              });
            // console.log(req.session.userId, '<<')

            res.redirect(`/invoice?id=${newInvoice.id}`);
        } catch (err) {
            console.error("Error during checkout:", err);
            res.status(500).send("Terjadi kesalahan saat checkout");
        }
    }

    static async invoice(req, res) {
        try {
            const invoiceId = req.query.id;

            // console.log('invoiceId: ',invoiceId);

            const invoice = await Invoice.findByPk(invoiceId, {
                include: [{
                    model: User,
                    include: [Profile]
                }]
            });

            const order = req.session.lastOrder || [];

            const total = order.reduce((sum, item) => sum + (item.price * item.quantity), 0);

            const formattedDate = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

            const profileName = invoice.User?.Profile?.profileName || 'Tanpa Nama';

            res.render('invoice', {
                profileName,
                date: formattedDate,
                invoiceCode: invoice.code,
                orderItems: order,
                total,
                formatRupiah
            });
        } catch (err) {
            console.error("Error displaying invoice:", err);
            res.send("Error di Invoice");
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