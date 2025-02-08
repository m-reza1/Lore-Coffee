const express = require('express')
const app = express()
const port = 3000
const router = require('./routers')
const session = require('express-session')
const path = require("path");

app.use('/', express.static(path.join(__dirname, 'public')))

app.use(session({
  secret: 'bsd24',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    sameSite: true
  }
}))

app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs')

app.use(router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})