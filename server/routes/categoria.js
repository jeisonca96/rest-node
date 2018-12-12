const express = require('express')
const Categoria = require('../models/categoria')
const auth = require('../middlewares/authorization')
const _ = require('underscore')

const app = express()

app.post('/categoria', [auth.verificarToken, auth.verificarRole], (req, res) => {

    let body = req.body;
    let categoria = new Categoria({
        name: body.name,
        description: body.description,
        usuario: req.usuario._id
    })
    categoria.save((er, categoriaDB) => {
        if (er) {
            return res.status(400).json({
                ok: false,
                er
            })
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
})

app.get('/categoria', auth.verificarToken, (req, res) => {

    Categoria.find({ state: true })
        .sort('name')
        .populate('usuario', 'name email')
        .exec((er, categorias) => {
            if (er) {
                return res.status(400).json({
                    ok: false,
                    er
                })
            }

            Categoria.countDocuments({ state: true }, (er, conteo) => {
                res.json({
                    ok: true,
                    count: conteo,
                    categorias
                })
            })
        })
})

app.get('/categoria/:id', auth.verificarToken, (req, res) => {

    let id = req.params.id

    Categoria.findById(id, (er, categoriaDB) => {
        if (er) {
            return res.status(400).json({
                ok: false,
                er
            })
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                er: {
                    message: 'Categoria no encontrado'
                }
            })
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
})

app.put('/categoria/:id', [auth.verificarToken, auth.verificarRole], (req, res) => {
    let id = req.params.id
    let body = req.body

    //Armamos body con los datos que queremos
    body = _.pick(req.body, ['name', 'description'])

    // new devuelve el objeto actualizado
    Categoria.findByIdAndUpdate(id, body, { new: true }, (er, categoriaDB) => {
        if (er) {
            return res.status(400).json({
                ok: false,
                er
            })
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                er: {
                    message: 'Categoria no encontrado'
                }
            })
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
})

app.delete('/categoria/:id', [auth.verificarToken, auth.verificarRole], (req, res) => {
    let id = req.params.id;

    //Armamos body con los datos que queremos
    body = {
        state: false
    }

    // new devuelve el objeto actualizado
    // runValidators para ejecutar las validaciones creada en el modelo
    Categoria.findByIdAndUpdate(id, body, { new: true }, (er, categoriaDB) => {
        if (er) {
            return res.status(400).json({
                ok: false,
                er
            })
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                er: {
                    message: 'categoria no encontrado'
                }
            })
        }
        res.json({
            ok: true,
            categoria: categoriaDB
        })
    })
})

module.exports = app;