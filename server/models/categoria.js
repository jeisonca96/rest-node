const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    name: {
        type: String,
        require: [true, 'El nombre de la categoria es requerido']
    },
    description: {
        type: String,
        require: [true, 'La descripción es requerida'],
        unique: true
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'usuario'
    },
    state: {
        type: Boolean,
        default: true
    },
})

module.exports = mongoose.model('categoria', categoriaSchema)