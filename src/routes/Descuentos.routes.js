import { Router } from "express";
import * as descuentosController from "../controllers/Descuentos.controller.js";

const router = Router();

// Obtener todos los productos con descuento
router.get("/descuentos", descuentosController.obtenerDescuentos);

// Obtener un producto con descuento por ID
router.get("/descuentos/:id", descuentosController.obtenerDescuentoPorId);

export default router;
