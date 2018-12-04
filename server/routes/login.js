const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.CLIENT_ID)
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
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        })
    })
})

// CONFIGURACIONES DE GOOGLE
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res) => {
    let token = req.body.idtoken;
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                er: e
            })
        })

    Usuario.findOne({ email: googleUser.email }, (er, usuarioDB) => {
        if (er) {
            return res.status(400).json({
                ok: false,
                er
            })
        }

        let user = {}
        if (usuarioDB) {

            // EN caso de tener un registro normal
            if (usuarioDB.google === false) {

                usuarioDB.google = true
                usuarioDB.save((er, usuarioUpdate) => {
                    if (er) {
                        return res.status(500).json({
                            ok: false,
                            er
                        })
                    }
                })
            }

            user = usuarioDB

        } else {
            let usuario = new Usuario()

            usuario.name = googleUser.name
            usuario.email = googleUser.email
            usuario.img = googleUser.img
            usuario.google = googleUser.google
            usuario.password = 'No-Password'

            usuario.save((er, usuarioDB) => {
                if (er) {
                    return res.status(500).json({
                        ok: false,
                        er
                    })
                }
                user = usuarioDB
            })
        }

        // Crear token
        let token = jwt.sign({
            usuario: user
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN })

        res.json({
            ok: true,
            usuario: user,
            token
        })
    })
})

module.exports = app;