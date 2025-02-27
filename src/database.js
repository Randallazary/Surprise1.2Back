import mongoose from 'mongoose';
import dns from 'dns';
import net from 'net';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // Conexión a Prisma

// URI de MongoDB Atlas (Producción)
// const atlasURI = 'mongodb+srv://randyrubio06:tacodepastor1@dbsurprise.u639y.mongodb.net/dbSurprise?retryWrites=true&w=majority';

// URI local para la base de datos 'Refaccionaria'  
// const localURI = 'mongodb://localhost:27017/surpriseDB';

// Función para conectar a MongoDB con reintento automático
/*
const connectWithRetry = (uri) => {
  mongoose.connect(uri,)
    .then(() => console.log('Conexión exitosa a MongoDB'))
    .catch((err) => {
      console.error('Error al conectar a la DB:', err);
      dns.resolve('www.google.com', (dnsErr) => {
        if (dnsErr) {
          console.error('Problema de conectividad a internet, reintentando...');
        } else if (!net.isIP('cluster0.dnsqacd.mongodb.net')) {
          console.error('No se puede resolver el DNS de la base de datos, reintentando...');
        } else {
          console.error('Error desconocido, reintentando...');
        }
        setTimeout(() => connectWithRetry(uri), 5000); // Reintenta cada 5 segundos
      });
    });
};
*/

// Conectar Prisma
async function connectPrisma() {
  try {
    await prisma.$connect();
    console.log('✅ Conexión exitosa a SQL Server con Prisma');
  } catch (error) {
    console.error('❌ Error al conectar con SQL Server:', error);
  }
}

connectPrisma(); // Ejecuta la conexión a Prisma

// Exportar Prisma para su uso en otros archivos
export { prisma };

// export default mongoose; // Descomentar si quieres seguir usando MongoDB también