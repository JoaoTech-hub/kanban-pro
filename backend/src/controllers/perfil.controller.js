const bcrypt = require("bcrypt");
const db = require("../config/db");

function obter(req, res, next) {
  try {
    const user = db
      .prepare("SELECT id, nome, usuario FROM usuarios WHERE id = ?")
      .get(req.usuarioId);

    if (!user) return res.status(404).json({ erro: "Usuário não encontrado" });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

function atualizar(req, res, next) {
  try {
    const { nome } = req.body;

    db.prepare("UPDATE usuarios SET nome = ? WHERE id = ?").run(nome, req.usuarioId);

    res.json({ mensagem: "Perfil atualizado" });
  } catch (err) {
    next(err);
  }
}

async function alterarSenha(req, res, next) {
  try {
    const { senhaAtual, novaSenha } = req.body;

    const user = db.prepare("SELECT senha FROM usuarios WHERE id = ?").get(req.usuarioId);

    const valido = await bcrypt.compare(senhaAtual, user.senha);
    if (!valido) return res.status(401).json({ erro: "Senha atual incorreta" });

    const hash = await bcrypt.hash(novaSenha, 10);

    db.prepare("UPDATE usuarios SET senha = ? WHERE id = ?").run(hash, req.usuarioId);

    res.json({ mensagem: "Senha alterada com sucesso" });
  } catch (err) {
    next(err);
  }
}

module.exports = { obter, atualizar, alterarSenha };
