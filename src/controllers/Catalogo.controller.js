import Catalogo from "../models/Catalogo.model.js";

// Obtener productos con filtros para el catálogo
export const getCatalogo = async (req, res) => {
    try {
      const { minPrice, maxPrice, category } = req.query;
      const filters = {};
      if (minPrice) filters.price = { ...filters.price, $gte: parseFloat(minPrice) };
      if (maxPrice) filters.price = { ...filters.price, $lte: parseFloat(maxPrice) };
      if (category) filters.category = category;
  
      const products = await Catalogo.find(filters, "name description price image category");
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener el catálogo de productos" });
    }
};

// Obtener detalles de un producto en el catálogo
export const getProductDetails = async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Catalogo.findById(id, "name description price image category stock rating reviews")
        .populate("reviews.user", "name email");
      if (!product) return res.status(404).json({ error: "Producto no encontrado" });
      res.status(200).json(product);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener detalles del producto" });
    }
};
