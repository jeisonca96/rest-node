const express = require('express')
const app = express()

const fs = require('fs')
const path = require('path')
const auth = require('../middlewares/authorization')

app.get('/imagen/:tipo/:img', auth.verificarTokenImg, (req, res) => {
    let tipo = req.params.tipo
    let img = req.params.img

    let pathFile = path.resolve(__dirname, `../../uploads/${tipo}/${img}`)
    if (fs.existsSync(pathFile)) {
        res.sendFile(pathFile)
    } else {
        let pathNoImage = path.resolve(__dirname, '../assets/img/no-image.jpg')
        res.sendFile(pathNoImage)
    }

})

module.exports = app