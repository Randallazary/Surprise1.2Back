import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Crear un nuevo producto con imágenes subidas a Cloudinary
 */ export const crearProducto = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      partNumber,
      category,
 
      discount,
     
    } = req.body;

    // 📌 Manejo de imágenes (Cloudinary)
    let imagesURLs = [];
    if (req.files && req.files.length > 0) {
      imagesURLs = req.files.map((file) => file.path);
    }

    // 📌 Crear el producto
    const newProduct = await prisma.productos.create({
      data: {
        name,
        description: description || "",
        price: price ? Number(price) : 0,
        stock: stock ? Number(stock) : 0,
        partNumber,
        category,

        discount: discount ? Number(discount) : 0,

        images: imagesURLs.length
          ? { create: imagesURLs.map((url) => ({ url })) }
          : undefined,

        // ✅ Solo agregar compatibilidad si hay datos
        compatibilities:
          parsedMakes.length > 0
            ? {
                create: parsedMakes.map((make, index) => ({
                  make,
                  model: parsedModels[index] || null, // Asignar null si no hay modelo
                  year: parsedYearsAsNumbers[index] || null, // Asignar null si no hay año
                  engineType: null, // Puedes agregar este campo si es necesario
                })),
              }
            : undefined, // No intenta crear compatibilidad si no hay datos
      },
      include: {
        images: true,
        compatibilities: true,
      },
    });

    return res.status(201).json({
      message: "Producto creado exitosamente",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error al crear el producto:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};


/**
 * Actualizar un producto (incluyendo subida de imágenes a Cloudinary)
 */
export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    // Extraer campos del body
    const {
      name,
      description,
      price,
      stock,
      partNumber,
      category,
      
      discount,
     
      removeOldImages,
      removeOldCompat,
    } = req.body;

    


    // Manejo de imágenes
    let newImagesURLs = [];
    if (req.files && req.files.length > 0) {
      newImagesURLs = req.files.map((file) => file.path);
    }

        // Transacción para asegurar la consistencia de los datos
    const updatedProduct = await prisma.$transaction(async (prisma) => {
      // 1. Actualizar los campos básicos del producto
      const product = await prisma.productos.update({
        where: { id: numericId },
        data: {
          name,
          description: description || undefined,
          price: price ? Number(price) : undefined,
          stock: stock ? Number(stock) : undefined,
          partNumber,
          category,
          
          // Manejo especial para discount:
          discount: discount !== undefined ? 
                   (discount !== null ? Number(discount) : null) : 
                   undefined,
        },
      });

      if (!product) {
        throw new Error("Producto no encontrado");
      }

      // 2. Manejo de imágenes
      if (removeOldImages === "true") {
        await prisma.imagenes.deleteMany({ 
          where: { productId: numericId } 
        });
      }

      if (newImagesURLs.length > 0) {
        await prisma.imagenes.createMany({
          data: newImagesURLs.map((url) => ({
            url,
            productId: numericId,
          })),
        });
      }

      // 3. Manejo de compatibilidades
      if (parsedMakes.length > 0) {
        // Eliminar compatibilidades existentes
        await prisma.compatibilidad.deleteMany({
          where: { productId: numericId },
        });

        // Crear nuevas compatibilidades
        await prisma.compatibilidad.createMany({
          data: parsedMakes.map((make, index) => ({
            make,
            model: parsedModels[index] || null,
            year: parsedYearsAsNumbers[index] || null,
            engineType: null,
            productId: numericId,
          })),
        });
      } else if (removeOldCompat === "true") {
        await prisma.compatibilidad.deleteMany({
          where: { productId: numericId },
        });
      }

      // Obtener el producto actualizado con relaciones
      return await prisma.productos.findUnique({
        where: { id: numericId },
        include: { 
          images: true, 
          compatibilities: true 
        },
      });
    });

    res.status(200).json({
      message: "Producto actualizado exitosamente",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    if (error.message === "Producto no encontrado" || error.code === "P2025") {
      return res.status(404).json({ message: "Producto no encontrado." });
    }
    res.status(500).json({ 
      message: "Error interno del servidor",
      error: error.message 
    });
  }
};
/**
 * Eliminar un producto
 */
export const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      return res.status(400).json({ message: "ID de producto no válido" });
    }

    // Usar transacción para asegurar la integridad de los datos
    await prisma.$transaction(async (prisma) => {
      // 1. Verificar si el producto existe
      const existingProduct = await prisma.productos.findUnique({
        where: { id: numericId },
        include: {
          images: true,
          compatibilities: true,
          sales: true,
          cartItems: true,
          pedidoItems: true,
        
        }
      });

      if (!existingProduct) {
        throw { code: "P2025", message: "Producto no encontrado" };
      }

      // 2. Eliminar todas las relaciones en el orden correcto
      // Primero las más dependientes (items de carrito, favoritos, etc.)
      await prisma.cartItem.deleteMany({ where: { productId: numericId } });
     
      await prisma.pedidoItem.deleteMany({ where: { productoId: numericId } });
      await prisma.sales.deleteMany({ where: { productId: numericId } });
      await prisma.imagenes.deleteMany({ where: { productId: numericId } });
      await prisma.compatibility.deleteMany({ where: { productId: numericId } });

      // 3. Finalmente eliminar el producto
      await prisma.productos.delete({ where: { id: numericId } });
    });

    res.status(200).json({ 
      message: "Producto y todas sus relaciones eliminadas exitosamente" 
    });

  } catch (error) {
    console.error("Error al eliminar producto:", error);
    
    if (error.code === "P2025") {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ 
      message: "Error interno del servidor",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
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
        compatibilities: true,
        supplier: true,
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

export const obtenerTodosLosProductos = async (req, res) => {
  const { 
    search, 
    categoria, 
    minPrecio, 
    maxPrecio, 
    page = 1, 
    pageSize = 10,
    includeFavorites = 'false' // Valor por defecto false
  } = req.query;

  // Validación
  const pageNumber = parseInt(page, 10);
  const pageSizeNumber = parseInt(pageSize, 10);
  if (isNaN(pageNumber) || isNaN(pageSizeNumber) || pageNumber < 1 || pageSizeNumber < 1) {
    return res.status(400).json({ message: "Parámetros de paginación inválidos." });
  }

  try {
    // Configuración base
    const whereConditions = {
      OR: [
        { name: { contains: search || "" } },
        { description: { contains: search || "" } },
        { category: { contains: search || "" } }
      ],
      category: categoria ? { equals: categoria } : undefined,
      price: {
        gte: minPrecio ? parseFloat(minPrecio) : undefined,
        lte: maxPrecio ? parseFloat(maxPrecio) : undefined,
      },
    };

    // Conteo total
    const totalProductos = await prisma.productos.count({ where: whereConditions });

    // Configuración de consulta
    const queryOptions = {
      where: whereConditions,
      skip: (pageNumber - 1) * pageSizeNumber,
      take: pageSizeNumber,
      include: {
        images: true,
        compatibilities: true,
        ...(includeFavorites === 'true' ? {
          favoritos: req.userId ? {
            where: { userId: req.userId },
            select: { id: true }
          } : undefined
        } : {})
      }
    };

    // Ejecución de consulta
    const productos = await prisma.productos.findMany(queryOptions);

  


  } catch (error) {
    console.error("Error en obtenerTodosLosProductos:", error);
    res.status(500).json({ 
      success: false,
      message: "Error interno del servidor",
      ...(process.env.NODE_ENV === 'development' && { 
        error: error.message,
        stack: error.stack 
      })
    });
  }
};

export const obtenerProductosAleatorios = async (req, res) => {
  const { cantidad = 5 } = req.query; // Cantidad de productos aleatorios a obtener (por defecto 5)

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
        images: true, // Incluir imágenes
        compatibilities: true, // Incluir compatibilidades
      },
    });

    res.status(200).json(productosAleatorios);
  } catch (error) {
    console.error("Error al obtener productos aleatorios:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};



export const obtenerProductosConDescuento = async (req, res) => {
  try {
    const productosConDescuento = await prisma.productos.findMany({
      where: {
        discount: {
          gt: 0, // Solo productos con descuento mayor a 0
        },
      },
      include: {
        images: true,
        compatibilities: true,
      },
    });

    res.status(200).json(productosConDescuento);
  } catch (error) {
    console.error("Error al obtener productos con descuento:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};