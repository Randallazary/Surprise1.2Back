import express from "express";
import { getFAQs, addFAQ } from "../controllers/FAQ.controller.js";

const router = express.Router();

// Ruta para obtener todas las preguntas frecuentes
router.get("/faq", getFAQs);

// Ruta para agregar una nueva pregunta frecuente
router.post("/faq", addFAQ);

export default router;
