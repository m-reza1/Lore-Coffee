let accountAuth = function accountAuth (req, res, next) {
    if (req.session.userId) next()
    else res.render('login')
  }

module.exports = accountAuth