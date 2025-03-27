import Descuento from "../models/Descuento.model.js";

// Obtener todos los productos con descuento
export const obtenerDescuentos = async (req, res) => {
  try {
    const descuentos = await Descuento.find();
    res.status(200).json(descuentos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los productos en descuento" });
  }
};

// Obtener un producto con descuento por ID
export const obtenerDescuentoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const descuento = await Descuento.findById(id);
    if (!descuento) {
      return res.status(404).json({ error: "Producto con descuento no encontrado" });
    }
    res.status(200).json(descuento);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el producto con descuento" });
  }
};
