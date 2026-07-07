const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { SEGREDO } = require("../middlewares/auth");

async function registrar(req, res, next) {
  try {
    const { nome, usuario, senha } = req.body;

    const existe = db.prepare("SELECT id FROM usuarios WHERE usuario = ?").get(usuario);
    if (existe) return res.status(400).json({ erro: "Usuário já existe" });

    const hash = await bcrypt.hash(senha, 10);

    const result = db
      .prepare("INSERT INTO usuarios (nome, usuario, senha) VALUES (?, ?, ?)")
      .run(nome, usuario, hash);

    // Cria colunas padrão para o novo usuário
    const colunas = ["A Fazer", "Em Andamento", "Concluído"];
    colunas.forEach((titulo, index) => {
      db.prepare("INSERT INTO colunas (titulo, ordem, usuario_id) VALUES (?, ?, ?)")
        .run(titulo, index, result.lastInsertRowid);
    });

    res.json({ mensagem: "Usuário criado com sucesso" });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { usuario, senha } = req.body;

    const user = db.prepare("SELECT * FROM usuarios WHERE usuario = ?").get(usuario);
    if (!user) return res.status(401).json({ erro: "Usuário ou senha inválidos" });

    const valido = await bcrypt.compare(senha, user.senha);
    if (!valido) return res.status(401).json({ erro: "Usuário ou senha inválidos" });

    const token = jwt.sign({ id: user.id, nome: user.nome }, SEGREDO, { expiresIn: "7d" });

    res.json({ token, nome: user.nome });
  } catch (err) {
    next(err);
  }
}

module.exports = { registrar, login };
