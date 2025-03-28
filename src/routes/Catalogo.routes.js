import { Router } from "express";
import * as catalogo from "../controllers/Catalogo.controller";
// Ruta CORRECTA (sube un nivel y luego entra a controllers)

const router = Router();

router.get("/catalogo", catalogo.getCatalogo);
router.get("/catalogo/:id", catalogo.getProductDetails);

export default router;