import { Router } from "express";
import * as contactController from "../controllers/Contactanos.controller.js";

const router = Router();

// Ruta para enviar un mensaje de contacto
router.post("/contact", contactController.sendMessage);

export default router;
