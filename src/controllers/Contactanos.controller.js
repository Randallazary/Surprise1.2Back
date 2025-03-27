import ContactMessage from "../models/Contactanos.model.js";

export const sendMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validaciones mejoradas
    if (!name.trim() || !email.trim() || !message.trim()) {
      return res.status(400).json({ error: "Todos los campos son obligatorios y deben contener texto válido" });
    }

    // Guardar el mensaje en la base de datos
    const newMessage = new ContactMessage({ name, email, message });
    await newMessage.save();

    return res.status(200).json({ message: "Mensaje enviado correctamente" });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return res.status(500).json({ error: "Error al enviar el mensaje", details: error.message });
  }
};
