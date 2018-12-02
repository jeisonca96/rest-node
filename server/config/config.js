// Puerto
process.env.PORT = process.env.PORT || 3000;

// Entorno 
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// Base de datos
let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    urlDB = 'mongodb://cafe_user:Node123456@ds161016.mlab.com:61016/cafe-node';
}
process.env.URLDB = urlDB;