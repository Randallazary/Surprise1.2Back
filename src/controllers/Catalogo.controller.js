import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Función para obtener el catálogo con filtros
export const getCatalogo = async (req, res) => {
    try {
        const { minPrice = 0, maxPrice = 10000, category } = req.query;
        
        // Validación de parámetros
        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);
        
        if (isNaN(min)) {
            return res.status(400).json({ 
                success: false,
                error: "minPrice debe ser un número" 
            });
        }
        
        if (isNaN(max)) {
            return res.status(400).json({ 
                success: false,
                error: "maxPrice debe ser un número" 
            });
        }

        if (min > max) {
            return res.status(400).json({ 
                success: false,
                error: "minPrice no puede ser mayor que maxPrice" 
            });
        }

        const products = await prisma.productos.findMany({
            where: {
                price: {
                    gte: min,
                    lte: max
                },
                category: category || undefined
            },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                category: true,
                brand: true,
                discount: true,
                images: {
                    select: {
                        url: true
                    },
                    take: 1
                }
            }
        });

        // Formatear respuesta
        const response = {
            success: true,
            data: products.map(product => ({
                ...product,
                image: product.images[0]?.url || '/default-product.jpg'
            })),
            meta: {
                count: products.length,
                filters: {
                    minPrice: min,
                    maxPrice: max,
                    category
                }
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error en getCatalogo:", error);
        res.status(500).json({ 
            success: false,
            error: "Error al obtener el catálogo",
            message: error.message
        });
    }
};

// Función para obtener detalles de un producto específico
export const getProductDetails = async (req, res) => {
    try {
        const productId = Number(req.params.id);
        
        if (isNaN(productId)) {
            return res.status(400).json({
                success: false,
                error: "ID de producto no válido"
            });
        }

        const product = await prisma.productos.findUnique({
            where: { id: productId },
            include: {
                images: {
                    select: {
                        url: true
                    }
                }
            }
        });

        if (!product) {
            return res.status(404).json({ 
                success: false,
                error: "Producto no encontrado" 
            });
        }

        const response = {
            success: true,
            data: {
                ...product,
                images: product.images.map(img => img.url),
                rating: 0, // Valor por defecto
                reviews: [] // Array vacío por compatibilidad
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error en getProductDetails:", error);
        res.status(500).json({ 
            success: false,
            error: "Error al obtener detalles del producto",
            message: error.message
        });
    }
};

// ELIMINA ESTA LÍNEA (es redundante):
// export { getCatalogo, getProductDetails };