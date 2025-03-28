import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Crear un nuevo producto con imágenes subidas a Cloudinary
 */
export const crearProducto = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category,
      brand,
      discount,
    } = req.body;

    // Validación mejorada
    if (!name || !category) {
      return res.status(400).json({ 
        message: "Nombre y categoría son campos obligatorios." 
      });
    }

    // Manejo de imágenes
    let imagesURLs = [];
    if (req.files && req.files.length > 0) {
      imagesURLs = req.files.map((file) => file.path);
    }

    // Crear el producto
    const newProduct = await prisma.productos.create({
      data: {
        name,
        description: description || "",
        price: price ? parseFloat(price) : 0,
        stock: stock ? parseInt(stock) : 0,
        category,
        brand: brand || "",
        discount: discount ? parseFloat(discount) : 0,
        images: imagesURLs.length
          ? { create: imagesURLs.map(url => ({ url })) }
          : undefined
      },
      include: {
        images: true,
      }
    });

    return res.status(201).json({
      message: "Producto creado exitosamente",
      product: newProduct
    });

  } catch (error) {
    console.error("Error detallado:", error);
    return res.status(500).json({ 
      message: "Error al crear producto",
      error: error.message
    });
  }
};

/**
 * Actualizar un producto (incluyendo subida de imágenes a Cloudinary)
 */
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    // Extraer campos del body (eliminadas compatibilities)
    const {
      name,
      description,
      price,
      stock,
      category,
      brand,
      discount,
    } = req.body;

    // req.files son las nuevas imágenes subidas
    let newImagesURLs = [];
    if (req.files && req.files.length > 0) {
      newImagesURLs = req.files.map((file) => file.path);
    }

    // 1. Actualizar los campos básicos del producto
    const updatedProduct = await prisma.productos.update({
      where: { id: numericId },
      data: {
        name,
        description,
        price: price ? Number(price) : undefined,
        stock: stock ? Number(stock) : undefined,
        category,
        brand,
        discount: discount ? Number(discount) : undefined,
      },
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    // 2. Manejo de imágenes
    if (
      typeof req.body.removeOldImages !== "undefined" &&
      req.body.removeOldImages === "true"
    ) {
      await prisma.imagenes.deleteMany({ where: { productId: numericId } });
    }

    // Crear las nuevas imágenes
    if (newImagesURLs.length > 0) {
      await prisma.imagenes.createMany({
        data: newImagesURLs.map((url) => ({
          url,
          productId: numericId,
        })),
      });
    }

    // 3. Eliminado: Manejo de compatibilidades

    // 4. Retornar el producto con sus relaciones actualizadas
    const productWithRelations = await prisma.productos.findUnique({
      where: { id: numericId },
      include: { 
        images: true, 
        // Eliminado: compatibilities 
      },
    });

    res.status(200).json({
      message: "Producto actualizado exitosamente",
      product: productWithRelations,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Eliminar un producto
 */
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    // Verificar si existe
    const existingProduct = await prisma.productos.findUnique({
      where: { id: numericId },
    });
    if (!existingProduct) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    // Borrar imágenes (las compatibilidades ya no existen)
    await prisma.imagenes.deleteMany({ where: { productId: numericId } });

    // Luego eliminar el producto
    await prisma.productos.delete({ where: { id: numericId } });

    res.status(200).json({ message: "Producto eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

/**
 * Obtener un producto por ID
 */
export const obtenerProductoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    const producto = await prisma.productos.findUnique({
      where: { id: numericId },
      include: {
        images: true,
        // Eliminado: compatibilities
      },
    });

    if (!producto) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    res.status(200).json(producto);
  } catch (error) {
    console.error("Error al obtener producto por ID:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Obtener todos los productos con filtros
export const obtenerTodosLosProductos = async (req, res) => {
  const { search, categoria, minPrecio, maxPrecio, page = 1, pageSize = 10 } = req.query;

  // Validar que page y pageSize sean números válidos
  const pageNumber = parseInt(page, 10);
  const pageSizeNumber = parseInt(pageSize, 10);

  if (isNaN(pageNumber) || isNaN(pageSizeNumber) || pageNumber < 1 || pageSizeNumber < 1) {
    return res.status(400).json({ message: "Parámetros de paginación inválidos." });
  }

  try {
    // Obtener el número total de productos (para paginación)
    const totalProductos = await prisma.productos.count({
      where: {
        OR: [
          {
            name: {
              contains: search || "",
            },
          },
          {
            description: {
              contains: search || "",
            },
          },
          {
            category: {
              contains: search || "",
            },
          },
        ],
        category: categoria ? { equals: categoria } : undefined,
        price: {
          gte: minPrecio ? parseFloat(minPrecio) : undefined,
          lte: maxPrecio ? parseFloat(maxPrecio) : undefined,
        },
      },
    });

    // Obtener los productos paginados
    const productos = await prisma.productos.findMany({
      where: {
        OR: [
          {
            name: {
              contains: search || "",
            },
          },
          {
            description: {
              contains: search || "",
            },
          },
          {
            category: {
              contains: search || "",
            },
          },
        ],
        category: categoria ? { equals: categoria } : undefined,
        price: {
          gte: minPrecio ? parseFloat(minPrecio) : undefined,
          lte: maxPrecio ? parseFloat(maxPrecio) : undefined,
        },
      },
      skip: (pageNumber - 1) * pageSizeNumber,
      take: pageSizeNumber,
      include: {
        images: true,
        // Eliminado: compatibilities
      },
    });

    // Respuesta con información de paginación
    res.status(200).json({
      productos,
      paginacion: {
        paginaActual: pageNumber,
        totalPaginas: Math.ceil(totalProductos / pageSizeNumber),
        totalProductos,
      },
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const obtenerProductosAleatorios = async (req, res) => {
  const { cantidad = 5 } = req.query;

  try {
    // Obtener el número total de productos
    const totalProductos = await prisma.productos.count();

    // Si hay menos productos que la cantidad solicitada, ajustar la cantidad
    const cantidadFinal = Math.min(cantidad, totalProductos);

    // Obtener todos los IDs de productos
    const todosLosIds = await prisma.productos.findMany({
      select: { id: true },
    });

    // Mezclar los IDs aleatoriamente
    const idsAleatorios = todosLosIds
      .map((producto) => producto.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, cantidadFinal);

    // Obtener los productos con los IDs aleatorios
    const productosAleatorios = await prisma.productos.findMany({
      where: {
        id: { in: idsAleatorios },
      },
      include: {
        images: true,
        // Eliminado: compatibilities
      },
    });

    res.status(200).json(productosAleatorios);
  } catch (error) {
    console.error("Error al obtener productos aleatorios:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};