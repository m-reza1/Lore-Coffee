const express = require('express')
const app = express()
const port = 3000
const router = require('./routers')
const session = require('express-session')

app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs')

app.use(router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})