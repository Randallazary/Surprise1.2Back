import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Configuración de rutas
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const logsDir = join(__dirname, '../../logs');

// Crear directorio logs si no existe
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const { combine, timestamp, printf } = winston.format;

// Formato simple sin tabla
const logFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ timestamp, level, message, ...metadata }) => {
    let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
    
    if (metadata && Object.keys(metadata).length > 0) {
      log += ` | ${JSON.stringify(metadata)}`;
    }
    
    return log;
  })
);

// Configuración del logger principal
const logger = winston.createLogger({
  level: 'debug',
  transports: [
    // Transporte para archivo diario
    new DailyRotateFile({
      filename: join(logsDir, 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '10m',
      maxFiles: '30d',
      format: logFormat,
      level: 'silly'
    }),
  ], 
});

// Middleware para Express simplificado
export const expressLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent']?.substring(0, 40) || 'desconocido'
    };
    
    if (res.statusCode >= 500) {
      logger.error('HTTP Request Error', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request Warning', logData);
    } else {
      logger.info('HTTP Request Success', logData);
    }
  });

  next();
};

// Función para registrar errores de validación
export const validationLogger = (validationErrors) => {
  validationErrors.array().forEach(error => {
    logger.warn('Validation Error', {
      message: error.msg,
      location: error.location,
      value: error.value,
      param: error.param
    });
  });
};

// Exportaciones
export { logger };
export default expressLogger;