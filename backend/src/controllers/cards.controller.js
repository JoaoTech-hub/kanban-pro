const db = require("../config/db");

function listar(req, res, next) {
  try {
    const cards = db
      .prepare("SELECT * FROM cards WHERE usuario_id = ? ORDER BY coluna_id, ordem")
      .all(req.usuarioId);
    res.json(cards);
  } catch (err) {
    next(err);
  }
}

function criar(req, res, next) {
  try {
    const { titulo, descricao, prioridade, prazo, coluna_id } = req.body;

    const colunaValida = db
      .prepare("SELECT id FROM colunas WHERE id = ? AND usuario_id = ?")
      .get(coluna_id, req.usuarioId);

    if (!colunaValida) {
      return res.status(404).json({ erro: "Coluna não encontrada" });
    }

    const ultimo = db
      .prepare("SELECT MAX(ordem) as max FROM cards WHERE coluna_id = ? AND usuario_id = ?")
      .get(coluna_id, req.usuarioId);

    const ordem = (ultimo.max ?? -1) + 1;

    const result = db
      .prepare(`
        INSERT INTO cards
        (titulo, descricao, prioridade, prazo, coluna_id, ordem, usuario_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .run(titulo, descricao ?? null, prioridade ?? "media", prazo ?? null, coluna_id, ordem, req.usuarioId);

    res.json({
      id: result.lastInsertRowid,
      titulo,
      descricao,
      prioridade,
      prazo,
      coluna_id,
      ordem,
    });
  } catch (err) {
    next(err);
  }
}

function atualizar(req, res, next) {
  try {
    const { titulo, descricao, prioridade, prazo, coluna_id } = req.body;

    const card = db
      .prepare("SELECT ordem FROM cards WHERE id = ? AND usuario_id = ?")
      .get(req.params.id, req.usuarioId);

    if (!card) {
      return res.status(404).json({ erro: "Tarefa não encontrada" });
    }

    const colunaValida = db
      .prepare("SELECT id FROM colunas WHERE id = ? AND usuario_id = ?")
      .get(coluna_id, req.usuarioId);

    if (!colunaValida) {
      return res.status(404).json({ erro: "Coluna não encontrada" });
    }

    db.prepare(`
      UPDATE cards
      SET titulo = ?, descricao = ?, prioridade = ?, prazo = ?, coluna_id = ?, ordem = ?
      WHERE id = ? AND usuario_id = ?
    `).run(titulo, descricao ?? null, prioridade, prazo ?? null, coluna_id, card.ordem, req.params.id, req.usuarioId);

    res.json({ mensagem: "Card atualizado" });
  } catch (err) {
    next(err);
  }
}

function excluir(req, res, next) {
  try {
    db.prepare("DELETE FROM cards WHERE id = ? AND usuario_id = ?")
      .run(req.params.id, req.usuarioId);
    res.json({ mensagem: "Card removido" });
  } catch (err) {
    next(err);
  }
}

function mover(req, res, next) {
  try {
    const { coluna_id, ordem } = req.body;

    const colunaValida = db
      .prepare("SELECT id FROM colunas WHERE id = ? AND usuario_id = ?")
      .get(coluna_id, req.usuarioId);

    if (!colunaValida) {
      return res.status(404).json({ erro: "Coluna não encontrada" });
    }

    db.prepare("UPDATE cards SET coluna_id = ?, ordem = ? WHERE id = ? AND usuario_id = ?")
      .run(coluna_id, ordem, req.params.id, req.usuarioId);

    res.json({ mensagem: "Card movido" });
  } catch (err) {
    next(err);
  }
}

module.exports = { listar, criar, atualizar, excluir, mover };
