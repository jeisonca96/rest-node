const express = require('express')
const Usuario = require('../models/usuario')
const auth = require('../middlewares/authorization')
const bcrypt = require('bcrypt');
const _ = require('underscore');

const app = express()

app.get('/usuario', auth.verificarToken, (req, res) => {

    let desde = Number(req.query.desde) || 0;
    let limite = Number(req.query.limite) || 0;

    Usuario.find({ state: true }, 'name email role state google img')
        .skip(desde)
        .limit(limite)
        .exec((er, usuarios) => {
            if (er) {
                return res.status(400).json({
                    ok: false,
                    er
                })
            }

            Usuario.count({ state: true }, (er, conteo) => {
                res.json({
                    ok: true,
                    count: conteo,
                    usuarios
                })
            })
        })
})

app.post('/usuario', [auth.verificarToken, auth.verificarRole], (req, res) => {

    let body = req.body;
    let usuario = new Usuario({
        name: body.name,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    })
    usuario.save((er, usuarioDB) => {
        if (er) {
            return res.status(400).json({
                ok: false,
                er
            })
        }

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })
})

app.put('/usuario/:id', [auth.verificarToken, auth.verificarRole], (req, res) => {
    let id = req.params.id
    let body = req.body

    //Armamos body con los datos que queremos
    body = _.pick(req.body, ['name', 'email', 'img', 'role', 'state'])

    // new devuelve el objeto actualizado
    // runValidators para ejecutar las validaciones creada en el modelo
    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (er, usuarioDB) => {
        if (er) {
            return res.status(400).json({
                ok: false,
                er
            })
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                er: {
                    message: 'Usuario no encontrado'
                }
            })
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })
})

app.delete('/usuario/:id', [auth.verificarToken, auth.verificarRole], (req, res) => {
    let id = req.params.id;

    // Eliminar
    // Usuario.findByIdAndRemove(id, (er, usuarioEliminado) => {
    //     if (er) {
    //         return res.status(400).json({
    //             ok: false,
    //             er
    //         })
    //     }
    //     if (!usuarioEliminado) {
    //         return res.status(400).json({
    //             ok: false,
    //             er: {
    //                 message: 'Usuario no encontrado'
    //             }
    //         })
    //     }
    //     res.json({
    //         ok: true,
    //         usuario: usuarioEliminado
    //     })
    // })

    //Armamos body con los datos que queremos
    body = {
        state: false
    }

    // new devuelve el objeto actualizado
    // runValidators para ejecutar las validaciones creada en el modelo
    Usuario.findByIdAndUpdate(id, body, { new: true }, (er, usuarioDB) => {
        if (er) {
            return res.status(400).json({
                ok: false,
                er
            })
        }
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                er: {
                    message: 'Usuario no encontrado'
                }
            })
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })
})

module.exports = app;