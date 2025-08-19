// middlewares/auth.middleware.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const verificarToken = (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }
        
        // Verificación del token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Token inválido' });
            }
            req.userId = decoded.id;
            next();
        });
    } catch (error) {
        return res.status(500).json({ message: 'Error al verificar token' });
    }
};