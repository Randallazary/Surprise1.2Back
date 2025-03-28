import { Router } from "express";
import { getCatalogo, getProductDetails } from "../controllers/Catalogo.controller";
// Ruta CORRECTA (sube un nivel y luego entra a controllers)

const router = Router();

router.get("/catalogo", getCatalogo);
router.get("/catalogo/:id", getProductDetails);

export default router;