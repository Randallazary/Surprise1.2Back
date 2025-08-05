import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import path from 'path';
import logger from './utils/logger.js'; // Importación corregida

// Importación de rutas
import user from './routes/User.routes.js';
import politicas from './routes/Politicas.routes.js';
import terminos from './routes/Terminos.routes.js';
import deslinde from './routes/Deslinde.routes.js';
import logoRoutes from './routes/Logo.routes.js';
import producto from './routes/Producto.route.js';
import catalogo from './routes/Catalogo.routes.js';
import descuento from './routes/Descuentos.routes.js';
import contactanos from './routes/Contactanos.routes.js';
import reloj from './routes/Reloj.routes.js';
import carrito from './routes/Carrito.routes.js';
import pedidos from './routes/Pedidos.routes.js';
import paypalRoutes from './routes/paypal.routes.js';


// Configuración CORS
const allowedOrigins = [
  'http://localhost:3000',
  'https://surprise1-2.vercel.app',
  'https://surprisewebapp.netlify.app',
  'http://10.0.2.16' // Emulador de Android
];

const app = express();

// ==================== CONFIGURACIÓN DE SEGURIDAD ====================
app.disable('x-powered-by');

// Protección básica con Helmet
app.use(helmet());
app.use(helmet.frameguard({ action: 'deny' }));

// CSP Config
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://www.google.com",
        "https://www.gstatic.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https://res.cloudinary.com"
      ],
      connectSrc: [
        "'self'",
        ...allowedOrigins
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com"
      ],
      frameSrc: [
        "'self'",
        "https://www.google.com"
      ]
    }
  })
);

// ==================== MIDDLEWARES ====================
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Logger middleware (importado desde utils/logger.js)
app.use(logger);

// ==================== RUTAS ====================
app.use('/api/auth', user);
app.use('/api/docs', politicas);
app.use('/api/docs', terminos);
app.use('/api/docs', deslinde);
app.use('/api/logo', logoRoutes);
app.use('/api/productos', producto);
app.use('/api/catalogo', catalogo);
app.use('/api/descuento', descuento);
app.use('/api/contactanos', contactanos);
app.use('/api/reloj', reloj);
app.use('/api/carrito', carrito);
app.use('/api/pedidos', pedidos)
app.use('/api/paypal', paypalRoutes);


// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    status: 'active',
    message: 'Backend operativo',
    timestamp: new Date().toISOString()
  });
});

// ==================== MANEJO DE ERRORES ====================
// 404 - Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    path: req.path,
    method: req.method
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('Error global:', err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error'
  });
});

export default app;