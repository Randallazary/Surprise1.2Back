    import { PrismaClient } from "@prisma/client";
    const prisma = new PrismaClient();

    
    export const obtenerPedidosPorEstado = async (req, res) => {
    try {
        const { estado } = req.query;

        // Validar que el estado sea uno de los válidos
        const estadosValidos = ["EN_PROCESO", "EN_CAMINO", "ENTREGADO"];
        if (!estado || !estadosValidos.includes(estado)) {
        return res.status(400).json({ message: "Estado de pedido inválido" });
        }

        const pedidos = await prisma.pedido.findMany({
        where: {
            estado: estado,
        },
        include: {
            cliente: {
            select: {
                id: true,
                name: true,
                lastname: true,
            },
            },
            items: {
            include: {
                producto: {
                select: {
                    id: true,
                    name: true,
                },
                },
            },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        });

        return res.status(200).json(pedidos);
    } catch (error) {
        console.error("Error al obtener pedidos por estado:", error);
        return res.status(500).json({ message: "Error interno del servidor" });
    }
    };