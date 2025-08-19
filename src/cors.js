import cors from 'cors';

const ACCPETED_ORIGINS = [
  'http://localhost:3000',
  'https://surprise1-2.vercel.app',
  'https://surprisewebapp.netlify.app',
  'http://10.0.2.16', // Emulador de Android
  'http://192.168.43.190',
  'http://192.168.43.77'
];

export const corsMiddleware = ({ acceptedOrigins = ACCPETED_ORIGINS } = {}) =>
  cors({
    origin: (origin, cb) => {
      if (acceptedOrigins.includes(origin)) {
        return cb(null, true);
      }

      if (!origin) {
        return cb(null, true);
      }

      return cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });