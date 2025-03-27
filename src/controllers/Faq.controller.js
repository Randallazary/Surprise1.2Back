import FAQ from "../models/Faq.model.js";

// Obtener todas las preguntas frecuentes
export const getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find();
    return res.status(200).json(faqs);
  } catch (error) {
    console.error("Error al obtener las preguntas frecuentes:", error);
    return res.status(500).json({ error: "Error al obtener las preguntas frecuentes" });
  }
};

// Agregar una nueva pregunta frecuente
export const addFAQ = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question.trim() || !answer.trim()) {
      return res.status(400).json({ error: "La pregunta y la respuesta son obligatorias" });
    }

    const newFAQ = new FAQ({ question, answer });
    await newFAQ.save();

    return res.status(201).json({ message: "Pregunta frecuente agregada correctamente" });
  } catch (error) {
    console.error("Error al agregar la pregunta frecuente:", error);
    return res.status(500).json({ error: "Error al agregar la pregunta frecuente" });
  }
};
