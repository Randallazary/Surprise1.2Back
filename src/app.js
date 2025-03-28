import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet'; // Asegúrate de importar helmet
import path from 'path'; // Asegúrate de importar path
import crypto from 'crypto'; // Importa el módulo de crypto


// Importación de las rutas desde src/routes
import user from './routes/User.routes.js';
import politicas from './routes/Politicas.routes.js';
import terminos from './routes/Terminos.routes.js';
import deslinde from './routes/Deslinde.routes.js';
import logoRoutes from './routes/Logo.routes.js';
import producto from './routes/Producto.route.js';
import catalogo from './routes/Catalogo.routes.js';
import descuento from './routes/Descuentos.routes.js';
import contactanos from './routes/Contactanos.routes.js';
import ubicacion from './routes/Ubicacion.routes.js';
import Faq from './routes/Faq.routes.js';


// Configuración de CORS para producción
const listWhite = [
  'http://localhost:3000',  // Frontend en desarrollo
  //'https://surprise1-2.vercel.app', // Frontend correcto en producción
];

const corsOptions = {
  origin: listWhite,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'x-access-notification'],
};

const app = express();

// --- Seguridad: Evitar divulgación de información interna ---
app.disable('x-powered-by');

// Anti-Clickjacking: impide que la app se cargue en iframes de otros dominios
app.use(helmet.frameguard({ action: 'deny' }));




app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],

      scriptSrc: [
        "'self'",
        "'nonce-randomString'", // Usa un nonce dinámico en cada respuesta
        "https://www.google.com",
        "https://www.gstatic.com",
        "https://www.recaptcha.net"
      ],

      styleSrc: [
        "'self'",
        "https://fonts.googleapis.com"
      ],

      imgSrc: [
        "'self'",
        "data:",
        "https://res.cloudinary.com"
      ],

      connectSrc: [
        "'self'",
        "http://localhost:4000",
        "http://localhost:3000",
        "https://api.pwnedpasswords.com",
        "https://www.google.com",
        "https://www.gstatic.com",
        "https://surprise1-2.vercel.app",
        "https://surprise1-2-back.vercel.app"

      ],

      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],

      objectSrc: ["'none'"],

      frameSrc: [
        "'self'",
        "https://www.google.com",
        "https://www.gstatic.com"
      ]
    },
  })
);



// Agrega el header X-Content-Type-Options para evitar sniffing
app.use(helmet.noSniff());

// --- Control de Caché: evitar almacenamiento de información sensible ---
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Otros middlewares
app.use(cors({
  //Pruebas
  origin: ['http://localhost:3000', 'https://surprise1-2.vercel.ap'],
  // origin: 'http://localhost:5173',
  credentials:true
}));

//app.use(cors(corsOptions));
//app.options('*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Rutas
app.use('/api/auth', user);
app.use('/api/docs', politicas);
app.use('/api/docs', terminos);
app.use('/api/docs', deslinde);
app.use('/api/logo', logoRoutes);
app.use('/api/productos', producto);
app.use('/api/catalogo', catalogo);
app.use('/api/descuento', descuento);
app.use('/api/contactanos', contactanos);
app.use('/api/ubicacion', ubicacion); // Corregido el punto extra
app.use('/api/faq', Faq); // Corregido el punto extra


app.get('/', (req, res) => {
  res.json({ msg: "Bienvenido a la API de tu proyecto" });
});

// Manejo de rutas no encontradas (404)
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(process.cwd(), 'public', '404.jpg'));
});


export default app;