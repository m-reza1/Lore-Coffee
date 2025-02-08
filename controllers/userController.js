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
            const { userName, email, password } = req.body;

            const createUser = await User.create({
                userName,
                email,
                password
            }, { returning: true });

            await Profile.create({
                profileName: 'Blm ada mas',
                phoneNumber: 'masih kosong mas',
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
                total: order.reduce((sum, item) => sum + (item.price * item.quantity), 0),
                status: "Paid"
            });

            // Simpan order sementara ke session agar bisa ditampilkan di invoice
            req.session.lastOrder = req.session.order; // Simpan order sebelum dihapus
            req.session.order = []; // Kosongkan keranjang belanja setelah checkout

            // Redirect ke halaman invoice dengan mengirim invoice id
            res.redirect(`/invoice?id=${newInvoice.id}`);
        } catch (err) {
            console.log(err);
            res.send(err);
        }
    }

    static async sendInvoiceEmail(req, res) {
        try {
            const { invoiceId } = req.body;
            // Ambil invoice dari database
            const invoice = await Invoice.findByPk(invoiceId);
            if (!invoice) {
                return res.status(404).send("Invoice tidak ditemukan");
            }

            // Ambil data user untuk mendapatkan alamat email
            const user = await User.findByPk(invoice.userId);
            if (!user) {
                return res.status(404).send("User tidak ditemukan");
            }

            // Ambil profile (misalnya untuk menampilkan nama pemesan)
            const profile = await Profile.findOne({ where: { userId: invoice.userId } });

            // Ambil data order yang digunakan untuk invoice
            // Catatan: Data order diambil dari session yang sebelumnya disimpan di saat checkout.
            const order = req.session.lastOrder || [];

            // --- Membangun Invoice Code ---
            const orderDate = new Date(invoice.createdAt);
            const year = orderDate.getFullYear();
            const month = String(orderDate.getMonth() + 1).padStart(2, '0');
            const day = String(orderDate.getDate()).padStart(2, '0');
            const dateStr = `${year}${month}${day}`;

            const hours = String(orderDate.getHours()).padStart(2, '0');
            const minutes = String(orderDate.getMinutes()).padStart(2, '0');
            const seconds = String(orderDate.getSeconds()).padStart(2, '0');
            const timeStr = `${hours}${minutes}${seconds}`;

            let categoryLetter = "X";
            if (order.length > 0) {
                const firstOrderItem = order[0];
                const itemDetail = await Item.findByPk(firstOrderItem.id, {
                    include: { model: Category }
                });
                if (itemDetail && itemDetail.Category && itemDetail.Category.categoryName) {
                    categoryLetter = itemDetail.Category.categoryName.charAt(0).toUpperCase();
                }
            }
            const invoiceCode = `${dateStr}-${categoryLetter}-${timeStr}`;

            // Render template email (Anda bisa membuat template khusus untuk email, misalnya: invoice_email_template.ejs)
            // Jika ingin menggunakan template invoice.ejs yang sudah ada, pastikan template tersebut tidak mengandung script browser-only.
            const templatePath = path.join(__dirname, '../views/invoice_email_template.ejs');
            const htmlContent = await ejs.renderFile(templatePath, {
                profile,
                invoice,
                order,
                invoiceCode,
                formatRupiah
            });

            // Konfigurasi NodeMailer (gunakan konfigurasi sesuai dengan penyedia email Anda)
            let transporter = nodemailer.createTransport({
                service: 'gmail', // contoh menggunakan Gmail
                auth: {
                    user: process.env.EMAIL_USER, // simpan email pengirim di environment variable
                    pass: process.env.EMAIL_PASS  // simpan password di environment variable
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: `Invoice from Lore Coffee - ${invoiceCode}`,
                html: htmlContent
            };

            // Kirim email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                    return res.status(500).send("Gagal mengirim email");
                } else {
                    console.log('Email sent: ' + info.response);
                    return res.send("Invoice telah dikirim ke email Anda");
                }
            });
        } catch (err) {
            console.error(err);
            res.status(500).send(err);
        }
    }


    static async invoice(req, res) {
        try {
            // Ambil invoice berdasarkan id dari query parameter
            const invoiceId = req.query.id;
            const invoice = await Invoice.findByPk(invoiceId);
            if (!invoice) {
                return res.status(404).send("Invoice tidak ditemukan");
            }

            // Dapatkan data profile (untuk nama pemesan) berdasarkan userId pada invoice
            const profile = await Profile.findOne({ where: { userId: invoice.userId } });

            // Ambil data order dari session (disimpan saat checkout)
            const order = req.session.lastOrder || [];

            // --- Membangun Invoice Code ---
            // Format: YYYYMMDD - [A/E/C/M] - HHMMSS
            // Misal: 20250208-A-143205
            const orderDate = new Date(invoice.createdAt); // pastikan ini berupa objek Date
            const year = orderDate.getFullYear();
            const month = String(orderDate.getMonth() + 1).padStart(2, '0');
            const day = String(orderDate.getDate()).padStart(2, '0');
            const dateStr = `${year}${month}${day}`;

            const hours = String(orderDate.getHours()).padStart(2, '0');
            const minutes = String(orderDate.getMinutes()).padStart(2, '0');
            const seconds = String(orderDate.getSeconds()).padStart(2, '0');
            const timeStr = `${hours}${minutes}${seconds}`;

            // Ambil huruf pertama dari categoryName item yang dipesan.
            // Jika ada lebih dari satu item, ambil dari item pertama.
            let categoryLetter = "";
            if (order.length > 0) {
                const firstOrderItem = order[0];
                // Cari detail item beserta kategorinya
                const itemDetail = await Item.findByPk(firstOrderItem.id, {
                    include: { model: Category }
                });
                if (itemDetail && itemDetail.Category && itemDetail.Category.categoryName) {
                    categoryLetter = itemDetail.Category.categoryName.charAt(0).toUpperCase();
                }
            }
            if (!categoryLetter) {
                categoryLetter = "X"; // Default jika tidak ditemukan
            }

            const invoiceCode = `${dateStr}-${categoryLetter}-${timeStr}`;

            // Pastikan invoice.total dihitung sebelum dikirim ke EJS
            invoice.total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);


            // Render view invoice dan kirim data yang diperlukan
            res.render('invoice', {
                profile,
                invoice,
                order,
                invoiceCode,
                formatRupiah
            });
        } catch (err) {
            console.log(err);
            res.send(err);
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