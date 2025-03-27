import { Router } from "express";
import * as ubicacionController from "../controllers/ubicacion.controller.js";

const router = Router();

// Ruta para obtener la ubicación
router.get("/ubicacion", ubicacionController.getUbicacion);

// Ruta para agregar una nueva ubicación
router.post("/ubicacion", ubicacionController.addUbicacion);

export default router;
