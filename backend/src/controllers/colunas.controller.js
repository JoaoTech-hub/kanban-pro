const db = require("../config/db");

function listar(req, res, next) {
  try {
    const colunas = db
      .prepare("SELECT * FROM colunas WHERE usuario_id = ? ORDER BY ordem")
      .all(req.usuarioId);
    res.json(colunas);
  } catch (err) {
    next(err);
  }
}

function criar(req, res, next) {
  try {
    const { titulo } = req.body;

    const ultima = db
      .prepare("SELECT MAX(ordem) as max FROM colunas WHERE usuario_id = ?")
      .get(req.usuarioId);

    const ordem = (ultima.max ?? -1) + 1;

    const result = db
      .prepare("INSERT INTO colunas (titulo, ordem, usuario_id) VALUES (?, ?, ?)")
      .run(titulo, ordem, req.usuarioId);

    res.json({ id: result.lastInsertRowid, titulo, ordem });
  } catch (err) {
    next(err);
  }
}

function renomear(req, res, next) {
  try {
    const { titulo } = req.body;

    const coluna = db
      .prepare("SELECT id FROM colunas WHERE id = ? AND usuario_id = ?")
      .get(req.params.id, req.usuarioId);

    if (!coluna) {
      return res.status(404).json({ erro: "Coluna não encontrada" });
    }

    db.prepare("UPDATE colunas SET titulo = ? WHERE id = ? AND usuario_id = ?")
      .run(titulo, req.params.id, req.usuarioId);

    res.json({ mensagem: "Coluna atualizada" });
  } catch (err) {
    next(err);
  }
}

function excluir(req, res, next) {
  try {
    // Confirma que a coluna existe E pertence ao usuário autenticado
    // ANTES de apagar qualquer card. Evita que um usuário apague cards
    // de uma coluna de outra pessoa apenas adivinhando o ID (IDOR).
    const coluna = db
      .prepare("SELECT id FROM colunas WHERE id = ? AND usuario_id = ?")
      .get(req.params.id, req.usuarioId);

    if (!coluna) {
      return res.status(404).json({ erro: "Coluna não encontrada" });
    }

    db.prepare("DELETE FROM cards WHERE coluna_id = ? AND usuario_id = ?")
      .run(req.params.id, req.usuarioId);
    db.prepare("DELETE FROM colunas WHERE id = ? AND usuario_id = ?")
      .run(req.params.id, req.usuarioId);

    res.json({ mensagem: "Coluna removida" });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, criar, renomear, excluir };
