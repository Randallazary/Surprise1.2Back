import { Router } from "express";
import {
  obtenerPedidosPorEstado
} from "../controllers/Reloj.controller.js";

const router = Router();

// 📬 Obtener pedidos filtrados por estado (query param ?estado=EN_PROCESO)
router.get("/pedidos", obtenerPedidosPorEstado);

export default router;