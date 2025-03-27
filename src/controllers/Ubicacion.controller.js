import Ubicacion from "../models/Ubicacion.model.js";

// Obtener ubicación desde la base de datos
export const getUbicacion = async (req, res) => {
  try {
    const ubicacion = await Ubicacion.findOne(); // Busca la primera ubicación registrada

    if (!ubicacion) {
      return res.status(404).json({ error: "No hay ubicaciones registradas" });
    }

    res.status(200).json(ubicacion);
  } catch (error) {
    console.error("Error al obtener la ubicación:", error);
    res.status(500).json({ error: "Error al obtener la ubicación" });
  }
};

// Agregar una nueva ubicación
export const addUbicacion = async (req, res) => {
  try {
    const { direccion, email, telefono, mapaUrl } = req.body;

    if (!direccion || !email || !telefono || !mapaUrl) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const nuevaUbicacion = new Ubicacion({ direccion, email, telefono, mapaUrl });
    await nuevaUbicacion.save();

    res.status(201).json({ message: "Ubicación agregada correctamente", nuevaUbicacion });
  } catch (error) {
    console.error("Error al agregar la ubicación:", error);
    res.status(500).json({ error: "Error al guardar la ubicación" });
  }
};
