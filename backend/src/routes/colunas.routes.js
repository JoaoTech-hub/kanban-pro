const { Router } = require("express");
const { autenticar } = require("../middlewares/auth");
const controller = require("../controllers/colunas.controller");
const { colunaSchema, validar } = require("../validators/schemas");

const router = Router();

router.get("/", autenticar, controller.listar);
router.post("/", autenticar, validar(colunaSchema), controller.criar);
router.put("/:id", autenticar, validar(colunaSchema), controller.renomear);
router.delete("/:id", autenticar, controller.excluir);

module.exports = router;
