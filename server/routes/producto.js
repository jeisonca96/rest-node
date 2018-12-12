const express = require('express')
const Producto = require('../models/producto')
const auth = require('../middlewares/authorization')
const _ = require('underscore')

const app = express()

app.post('/producto', [auth.verificarToken, auth.verificarRole], (req, res) => {

    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    })
    producto.save((er, productoDB) => {
        if (er) {
            return res.status(400).json({
                ok: false,
                er
            })
        }

        res.json({
            ok: true,
            producto: productoDB
        })
    })
})

app.get('/producto', auth.verificarToken, (req, res) => {

    let desde = Number(req.query.desde) || 0
    let limite = Number(req.query.limite) || 0

    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .sort('name')
        .populate('categoria', 'name description')
        .populate('usuario', 'name email')
        .exec((er, productos) => {
            if (er) {
                return res.status(400).json({
                    ok: false,
                    er
                })
            }

            Producto.countDocuments({ disponible: true }, (er, conteo) => {
                res.json({
                    ok: true,
                    count: conteo,
                    productos
                })
            })
        })
})


app.get('/producto/:id', auth.verificarToken, (req, res) => {

    let id = req.params.id

    Producto.findById(id)
        .populate('categoria', 'name description')
        .populate('usuario', 'name email')
        .exec((er, productoDB) => {
            if (er) {
                return res.status(400).json({
                    ok: false,
                    er
                })
            }

            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    er: {
                        message: 'Producto no encontrado'
                    }
                })
            }
            res.json({
                ok: true,
                producto: productoDB
            })
        })
})

app.put('/producto/:id', [auth.verificarToken, auth.verificarRole], (req, res) => {
    let id = req.params.id
    let body = req.body

    //Armamos body con los datos que queremos
    body = _.pick(req.body, ['name', 'precioUni', 'descripcion', 'categoria'])

    // new devuelve el objeto actualizado
    Producto.findByIdAndUpdate(id, body, { new: true }, (er, productoDB) => {
        if (er) {
            return res.status(400).json({
                ok: false,
                er
            })
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                er: {
                    message: 'producto no encontrado'
                }
            })
        }
        res.json({
            ok: true,
            producto: productoDB
        })
    })
})

app.delete('/producto/:id', [auth.verificarToken, auth.verificarRole], (req, res) => {
    let id = req.params.id;

    //Armamos body con los datos que queremos
    body = {
        disponible: false
    }

    // new devuelve el objeto actualizado
    // runValidators para ejecutar las validaciones creada en el modelo
    Producto.findByIdAndUpdate(id, body, { new: true }, (er, productoDB) => {
        if (er) {
            return res.status(400).json({
                ok: false,
                er
            })
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                er: {
                    message: 'Producto no encontrado'
                }
            })
        }
        res.json({
            ok: true,
            producto: productoDB
        })
    })
})

app.get('/producto/buscar/:termino', auth.verificarToken, (req, res) => {

    let termino = req.params.termino
    let regex = new RegExp(termino, 'i')

    Producto.find({ nombre: regex })
        .populate('categoria', 'name description')
        .populate('usuario', 'name email')
        .exec((er, productos) => {
            if (er) {
                return res.status(400).json({
                    ok: false,
                    er
                })
            }

            Producto.countDocuments({ nombre: regex }, (er, conteo) => {
                res.json({
                    ok: true,
                    count: conteo,
                    productos
                })
            })
        })
})

module.exports = app;