import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

// Importación de las rutas desde src/routes
import user from './routes/User.routes.js';
import politicas from './routes/Politicas.routes.js';
import terminos from './routes/Terminos.routes.js';
import deslinde from './routes/Deslinde.routes.js';

// Configuración de CORS para producción
const listWhite = [
    'http://localhost:3000',  // Frontend en desarrollo
    'https://surprise1-2.vercel.app', // Frontend correcto en producción
    
];

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir solicitudes sin origen (por ejemplo, herramientas como Postman)
        if (!origin) {
            return callback(null, true);
        }
        if (listWhite.includes(origin)) {
            callback(null, true); // Permitir el origen si está en la lista blanca
        } else {
            console.error(`CORS bloqueado para origen: ${origin}`); // Agregar mensaje de depuración
            callback(new Error('No permitido por CORS'));
        }
    }
};



const app = express();
app.use(morgan('dev'));
app.use(express.json());
app.use(cors( corsOptions ));
app.options('*', cors( corsOptions ));




// Rutas
app.use('/api/auth', user);
app.use('/api/docs', politicas);
app.use('/api/docs', terminos);
app.use('/api/docs', deslinde);


app.get('/', (req, res) => {
    res.json({ msg: "Bienvenido a la API de tu proyecto" });
});

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).json({ message: 'Ruta incorrecta' });
});

export default app;