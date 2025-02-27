import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

// Importación de las rutas desde src/routes
import user from './routes/User.routes.js';
import politicas from './routes/Politicas.routes.js';
import terminos from './routes/Terminos.routes.js';
import deslinde from './routes/Deslinde.routes.js';
import logoRoutes from './routes/Logo.routes.js';
import producto from './routes/Producto.route.js';



// Configuración de CORS para producción
const listWhite = [
    'http://localhost:3000',  // Frontend en desarrollo
    'https://surprise1-2.vercel.app', // Frontend correcto en producción
];

const corsOptions = {
    origin: function (origin, callback) {
        // Permitir solicitudes sin origen (como Postman)
        if (!origin) return callback(null, true);
        if (listWhite.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token','x-access-notification'],
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
app.use('/api/logo', logoRoutes);
app.use('/api/productos', producto);



app.get('/', (req, res) => {
    res.json({ msg: "Bienvenido a la API de tu proyecto" });
});

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(process.cwd(), 'public', '404.jpg'));
});




export default app;