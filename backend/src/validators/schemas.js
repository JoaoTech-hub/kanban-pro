const { z } = require("zod");

const registroSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100),
  usuario: z.string().trim().min(3, "Usuário deve ter ao menos 3 caracteres").max(50),
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres").max(200),
});

const loginSchema = z.object({
  usuario: z.string().trim().min(1, "Informe o usuário"),
  senha: z.string().min(1, "Informe a senha"),
});

const colunaSchema = z.object({
  titulo: z.string().trim().min(1, "O título da coluna é obrigatório").max(80),
});

const cardSchema = z.object({
  titulo: z.string().trim().min(1, "O título da tarefa é obrigatório").max(150),
  descricao: z.string().max(2000).optional().nullable(),
  prioridade: z.enum(["baixa", "media", "alta"]).optional().default("media"),
  prazo: z.string().max(30).optional().nullable(),
  coluna_id: z.number().int().positive(),
});

const moverCardSchema = z.object({
  coluna_id: z.number().int().positive(),
  ordem: z.number().int().min(0),
});

const perfilSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100),
});

const senhaSchema = z.object({
  senhaAtual: z.string().min(1, "Informe a senha atual"),
  novaSenha: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres").max(200),
});

// Middleware genérico: valida req.body contra um schema zod.
// Em caso de erro, responde 400 com a primeira mensagem de validação.
function validar(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) {
      const primeiraMsg = resultado.error.issues[0]?.message || "Dados inválidos";
      return res.status(400).json({ erro: primeiraMsg });
    }
    req.body = resultado.data;
    next();
  };
}

module.exports = {
  registroSchema,
  loginSchema,
  colunaSchema,
  cardSchema,
  moverCardSchema,
  perfilSchema,
  senhaSchema,
  validar,
};
