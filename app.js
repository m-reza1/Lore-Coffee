const express = require('express')
const app = express()
const port = 3000
const router = require('./routers')

//BODY PARSER
app.use(express.urlencoded({ extended: false }));

//TEMPLATE ENGINE
app.set('view engine', 'ejs')

//MIDDLEWARE
app.use(router);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})