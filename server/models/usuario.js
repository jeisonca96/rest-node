const mongoose = require('mongoose');
const unique_validator = require('mongoose-unique-validator')

let Schema = mongoose.Schema;

let rolesUser = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
}

let usuarioSchema = new Schema({
    name: {
        type: String,
        require: [true, 'El nombre es requerido']
    },
    email: {
        type: String,
        require: [true, 'El correo es requerido'],
        unique: true
    },
    password: {
        type: String,
        require: [true, 'El correo es requerido']
    },
    img: {
        type: String
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesUser
    },
    state: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    },
})

usuarioSchema.methods.toJSON = function() {
    let user = this
    let userObject = user.toObject()
    delete userObject.password

    return userObject
}

usuarioSchema.plugin(unique_validator, {
    message: '{PATH} debe ser único'
})

module.exports = mongoose.model('usuario', usuarioSchema)