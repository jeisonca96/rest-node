// Verificar Token
const jwt = require('jsonwebtoken')

let verificarToken = (req, res, next) => {
    let token = req.get('Authorization')

    jwt.verify(token, process.env.SEED, (er, decoded) => {
        if (er) {
            return res.status(401).json({
                ok: false,
                er
            })
        }

        req.usuario = decoded.usuario

        next()
    })

}

let verificarRole = (req, res, next) => {
    let usuario = req.usuario

    if (usuario.role != 'ADMIN_ROLE') {
        res.status(400).json({
            ok: false,
            er: {
                message: 'Acción no permitida'
            }
        })
    } else {
        next()
    }
}

// verificar token por url
let verificarTokenImg = (req, res, next) => {
    let token = req.query.token

    jwt.verify(token, process.env.SEED, (er, decoded) => {
        if (er) {
            return res.status(401).json({
                ok: false,
                er
            })
        }

        req.usuario = decoded.usuario

        next()
    })

}
module.exports = {
    verificarToken,
    verificarRole,
    verificarTokenImg
}