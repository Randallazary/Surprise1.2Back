import { Router } from "express";
import * as catalogoController from "../controllers/catalogo.controller.js"; // Asegúrate de que el archivo esté correctamente nombrado (minúsculas si es necesario)

const router = Router();

// Ruta para obtener el catálogo con filtros
router.get("/catalogo", catalogoController.getCatalogo);

// Ruta para obtener detalles de un producto específico en el catálogo
router.get("/catalogo/:id", catalogoController.getProductDetails);

export default router;
