const express = require('express')
const fileUpload = require('express-fileupload')
const app = express()
const Usuario = require('../models/usuario')
const Producto = require('../models/producto')
const fs = require('fs')
const path = require('path')

app.use(fileUpload())

app.put('/upload/:tipo/:id', (req, res) => {

    let tipo = req.params.tipo
    let id = req.params.id

    let tiposValidos = ['usuarios', 'productos']
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Tipos permitidos: ' + tiposValidos.join(', '),
                type: tipo
            }
        })
    }

    if (!req.files) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado archivo'
                }
            })
    }

    let archivo = req.files.archivo

    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg']
    let nombreArchivo = archivo.name.split('.')
    let extension = nombreArchivo[nombreArchivo.length - 1]

    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Extensiones permitidas: ' + extensionesValidas.join(', '),
                ext: extension
            }
        })
    }

    // Cambiar nombre al archivoHit
    let filename = `${id}-${ new Date().getMilliseconds() }.${extension}`
    let uploadPath = `uploads/${tipo}/${filename}`

    archivo.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (tipo == 'usuarios') {
            imagenUsuario(id, res, filename)
        } else {
            imagenProducto(id, res, filename)
        }
    });
})

function imagenUsuario(id, res, filename) {
    Usuario.findById(id, (err, usuarioBD) => {
        if (err) {
            borrarArchivo(filename, 'usuarios')
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!usuarioBD) {
            borrarArchivo(filename, 'usuarios')
            return res.status(400).json({
                ok: false,
                err
            })
        }

        borrarArchivo(usuarioBD.img, 'usuarios')

        usuarioBD.img = filename
        usuarioBD.save((err, userSave) => {
            res.json({
                ok: true,
                userSave,
                filename
            })
        })
    })
}

function imagenProducto(id, res, filename) {

    Producto.findById(id, (err, productoBD) => {
        if (err) {
            borrarArchivo(filename, 'productos')
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoBD) {
            borrarArchivo(filename, 'productos')
            return res.status(400).json({
                ok: false,
                err
            })
        }

        borrarArchivo(productoBD.img, 'productos')

        productoBD.img = filename
        productoBD.save((err, userSave) => {
            res.json({
                ok: true,
                userSave,
                filename
            })
        })
    })
}

function borrarArchivo(filename, type) {
    let pathFile = path.resolve(__dirname, `../../uploads/${type}/${filename}`)
    if (fs.existsSync(pathFile)) {
        fs.unlinkSync(pathFile)
    }
}

module.exports = app