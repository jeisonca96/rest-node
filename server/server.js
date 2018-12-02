require('./config/config')

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(require('./routes/usuario'))

mongoose.connect(process.env.URLDB, { useNewUrlParser: true }, (er, res) => {
    if (er) throw er;

    console.log('Base de datos online');

});

app.listen(process.env.PORT, () => {
    console.log(`Escuchando el puerto ${process.env.PORT}`);
})