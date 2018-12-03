const express = require('express')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario')

const app = express();

app.post('/login', (req, res) => {

    let id = req.params.id
    let body = req.body

    Usuario.findOne({ email: body.email }, (er, usuarioDB) => {
        if (er) {
            return res.status(500).json({
                ok: false,
                er
            })
        }
        if (!usuarioDB || !bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                er: {
                    message: 'Usuario y/o contraseña incorrectos'
                }
            })
        }

        let token = jwt.sign({
                usuario: usuarioDB
            }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }) //Expira en 30 días

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        })
    })
})

module.exports = app;