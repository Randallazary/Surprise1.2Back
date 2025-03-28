import { Router } from "express";
// Ruta CORRECTA (sube un nivel y luego entra a controllers)
import { getCatalogo, getProductDetails } from "./controllers/catalogo.controller.js";

const router = Router();

router.get("/catalogo", getCatalogo);
router.get("/catalogo/:id", getProductDetails);

export default router;