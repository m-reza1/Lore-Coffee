let accountAuth = function accountAuth (req, res, next) {
    if (req.session.userId) next()
    else res.render('login')
  }

// let checkRole = function checkRole (req, res, next) {
//   if (req.session.role === 'User') {
//     res.redirect('/')
//   } else {
//     next()
//   }
// }
module.exports = accountAuth