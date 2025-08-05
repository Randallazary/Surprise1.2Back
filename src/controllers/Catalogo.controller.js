import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Función para obtener el catálogo con filtros avanzados
export const getCatalogo = async (req, res) => {
    try {
        // Parámetros de consulta con valores por defecto
        const { 
            minPrice = 0, 
            maxPrice = 10000, 
            category, 
            ocasion,
            search,
            page = 1,
            pageSize = 12,
            sortBy = 'name',
            sortOrder = 'asc'
        } = req.query;
        
        // Validación de parámetros numéricos
        const min = parseFloat(minPrice);
        const max = parseFloat(maxPrice);
        const pageNum = parseInt(page);
        const size = parseInt(pageSize);
        
        if (isNaN(min) || isNaN(max) || isNaN(pageNum) || isNaN(size)) {
            return res.status(400).json({ 
                success: false,
                error: "Parámetros numéricos no válidos" 
            });
        }

        if (min > max) {
            return res.status(400).json({ 
                success: false,
                error: "El precio mínimo no puede ser mayor al máximo" 
            });
        }

        if (pageNum < 1 || size < 1) {
            return res.status(400).json({ 
                success: false,
                error: "Los parámetros de paginación deben ser positivos" 
            });
        }

        // Configuración de filtros
        const whereConditions = {
            AND: [
                {
                    price: {
                        gte: min,
                        lte: max
                    }
                },
                category ? { category: { equals: category } } : {},
                ocasion ? { ocasion: { equals: ocasion } } : {},
                search ? {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } }
                    ]
                } : {}
            ]
        };

        // Ordenamiento
        const orderBy = {};
        if (['name', 'price', 'createdAt', 'category'].includes(sortBy)) {
            orderBy[sortBy] = sortOrder === 'desc' ? 'desc' : 'asc';
        }

        // Consulta para el total de productos (para paginación)
        const totalProducts = await prisma.productos.count({
            where: whereConditions
        });

        // Consulta de productos con paginación
        const products = await prisma.productos.findMany({
            where: whereConditions,
            skip: (pageNum - 1) * size,
            take: size,
            orderBy,
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                category: true,
                ocasion: true,
                discount: true,
                stock: true,
                createdAt: true,
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
                image: product.images[0]?.url || '/default-product.jpg',
                hasDiscount: product.discount > 0,
                finalPrice: product.discount > 0 ? 
                    product.price * (1 - product.discount/100) : product.price
            })),
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalProducts / size),
                totalItems: totalProducts,
                itemsPerPage: size
            },
            filters: {
                applied: {
                    minPrice: min,
                    maxPrice: max,
                    ...(category && { category }),
                    ...(ocasion && { ocasion }),
                    ...(search && { search })
                },
                available: {
                    categories: await getAvailableCategories(),
                    occasions: await getAvailableOccasions()
                }
            },
            sort: {
                by: sortBy,
                order: sortOrder
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error en getCatalogo:", error);
        res.status(500).json({ 
            success: false,
            error: "Error al obtener el catálogo",
            ...(process.env.NODE_ENV === 'development' && {
                message: error.message,
                stack: error.stack
            })
        });
    }
};

// Función para obtener detalles completos de un producto
export const getProductDetails = async (req, res) => {
    try {
        const productId = parseInt(req.params.id);
        
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
                        url: true,
                        id: true
                    },
                    orderBy: {
                        id: 'asc'
                    }
                },
                supplier: {
                    select: {
                        id: true,
                        name: true,
                        rating: true
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

        // Calcular rating promedio (ejemplo)
        const rating = product.supplier ? product.supplier.rating : 4.5;

        const response = {
            success: true,
            data: {
                ...product,
                images: product.images.map(img => img.url),
                mainImage: product.images[0]?.url || '/default-product.jpg',
                rating,
                reviews: [], // Podrías añadir lógica para obtener reviews
                hasDiscount: product.discount > 0,
                finalPrice: product.discount > 0 ? 
                    product.price * (1 - product.discount/100) : product.price,
                stockStatus: product.stock > 0 ? 
                    (product.stock > 10 ? 'in_stock' : 'low_stock') : 'out_of_stock'
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error en getProductDetails:", error);
        res.status(500).json({ 
            success: false,
            error: "Error al obtener detalles del producto",
            ...(process.env.NODE_ENV === 'development' && {
                message: error.message,
                stack: error.stack
            })
        });
    }
};

// Funciones auxiliares
async function getAvailableCategories() {
    const categories = await prisma.productos.findMany({
        distinct: ['category'],
        select: {
            category: true
        },
        orderBy: {
            category: 'asc'
        }
    });
    return categories.map(c => c.category).filter(Boolean);
}

async function getAvailableOccasions() {
    const occasions = await prisma.productos.findMany({
        distinct: ['ocasion'],
        select: {
            ocasion: true
        },
        orderBy: {
            ocasion: 'asc'
        },
        where: {
            ocasion: {
                not: null
            }
        }
    });
    return occasions.map(o => o.ocasion).filter(Boolean);
}