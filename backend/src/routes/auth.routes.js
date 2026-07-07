const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const { registrar, login } = require("../controllers/auth.controller");
const { registroSchema, loginSchema, validar } = require("../validators/schemas");

const router = Router();

// Protege contra brute-force / enumeração de usuários:
// no máximo 10 tentativas a cada 15 minutos por IP.
const limiteAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { erro: "Muitas tentativas. Tente novamente em alguns minutos." },
});

router.post("/registro", limiteAuth, validar(registroSchema), registrar);
router.post("/login", limiteAuth, validar(loginSchema), login);

module.exports = router;
