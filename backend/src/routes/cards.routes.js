const { Router } = require("express");
const { autenticar } = require("../middlewares/auth");
const controller = require("../controllers/cards.controller");
const { cardSchema, moverCardSchema, validar } = require("../validators/schemas");

const router = Router();

router.get("/", autenticar, controller.listar);
router.post("/", autenticar, validar(cardSchema), controller.criar);
router.put("/:id", autenticar, validar(cardSchema), controller.atualizar);
router.delete("/:id", autenticar, controller.excluir);
router.put("/:id/mover", autenticar, validar(moverCardSchema), controller.mover);

module.exports = router;
