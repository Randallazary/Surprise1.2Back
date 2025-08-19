// reloj.routes.js
import { Router } from "express";

import { obtenerPedidosPorEstado } from "../controllers/Reloj.controller.js";
import { verificarCodigo } from "../controllers/Reloj.controller.js";

const router = Router();

// Ruta pública
router.get("/verificar/:codigo", verificarCodigo);
// Backend (ruta pública)
router.get("/pedidos", obtenerPedidosPorEstado);

export default router;