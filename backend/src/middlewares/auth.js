const jwt = require("jsonwebtoken");

const SEGREDO = process.env.JWT_SECRET;

function autenticar(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ erro: "Não autenticado" });

  try {
    const dados = jwt.verify(token, SEGREDO);
    req.usuarioId = dados.id;
    next();
  } catch {
    res.status(401).json({ erro: "Token inválido" });
  }
}

module.exports = { autenticar, SEGREDO };
