import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Controlador para obtener pedidos por estado
export const obtenerPedidosPorEstado = async (req, res) => {
    try {
        const { estado, id } = req.query;
        console.log("Estado recibido:", estado, "ID cliente:", id);


        const estadosValidos = ["EN_PROCESO", "EN_CAMINO", "ENTREGADO"];
        if (!estado || !estadosValidos.includes(estado)) {
            return res.status(400).json({ 
                success: false,
                message: "Estado de pedido inválido. Use: EN_PROCESO, EN_CAMINO o ENTREGADO" 
            });
        }

        const pedidos = await prisma.pedido.findMany({
            where: { estado: estado, clienteId: id ? Number(id) : undefined },
            include: {
                usuarios: {
                    select: { id: true, NAME: true, lastname: true }
                },
                pedidoitem: {
                    include: {
                        productos: {
                            select: { id: true, NAME: true }
                        }
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });
    


        return res.status(200).json({
            success: true,
            data: pedidos
        });

    } catch (error) {
        console.error("Error al obtener pedidos:", error);
        return res.status(500).json({ 
            success: false,
            message: "Error interno del servidor" 
        });
    }
};

// Controlador para verificación de código de acceso
export const verificarCodigo = async (req, res) => {
    const { codigo } = req.params;
    console.log("Código recibido:", codigo);
    try {
        
       
         // Buscar usuario
        const usuario = await prisma.usuarios.findUnique({
            where: { 
                codigo_acceso: codigo,
                blocked: false,
                
            },
            select: {
                id: true,
                NAME: true,
                lastname: true,
                
            }
        });

        if (!usuario) {
            return res.status(401).json({
                success: false,
                message: "Código inválido, usuario bloqueado o no verificado"
            });
        }

        // Resetear intentos fallidos si el login es exitoso
        if (usuario.failedLoginAttempts > 0) {
            await prisma.usuarios.update({
                where: { id: usuario.id },
                data: { failedLoginAttempts: 0 }
            });
        }

        // Registrar último login
        await prisma.usuarios.update({
            where: { id: usuario.id },
            data: { lastLogin: new Date() }
        });

        return res.status(200).json({
            success: true,
            message: "Autenticación exitosa",
            user: {
                id: usuario.id,
                name: `${usuario.NAME} ${usuario.lastname}`,
                
            }
        });

    } catch (error) {
        console.error("Error en verificación de código:", error);
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor"
        });
    }
};