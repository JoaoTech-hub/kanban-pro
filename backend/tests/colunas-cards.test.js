const request = require("supertest");
const app = require("../src/app");

async function criarUsuarioELogar(sufixo) {
  const usuario = {
    nome: `Usuario ${sufixo}`,
    usuario: `user_${sufixo}_${Date.now()}`,
    senha: "senha123",
  };

  await request(app).post("/registro").send(usuario);
  const login = await request(app).post("/login").send({
    usuario: usuario.usuario,
    senha: usuario.senha,
  });

  return login.body.token;
}

describe("Colunas e cards", () => {
  let tokenA;
  let tokenB;

  beforeAll(async () => {
    tokenA = await criarUsuarioELogar("a");
    tokenB = await criarUsuarioELogar("b");
  });

  test("cria e lista colunas do próprio usuário", async () => {
    const criar = await request(app)
      .post("/colunas")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ titulo: "Minha coluna" });

    expect(criar.status).toBe(200);

    const listar = await request(app)
      .get("/colunas")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(listar.status).toBe(200);
    expect(listar.body.some((c) => c.titulo === "Minha coluna")).toBe(true);
  });

  test(
    "REGRESSÃO (IDOR): usuário B não consegue apagar cards de uma coluna do usuário A " +
      "mesmo enviando o ID diretamente",
    async () => {
      // Usuário A cria uma coluna e um card dentro dela
      const colunaA = await request(app)
        .post("/colunas")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ titulo: "Coluna privada de A" });

      const cardA = await request(app)
        .post("/cards")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ titulo: "Tarefa de A", coluna_id: colunaA.body.id });

      expect(cardA.status).toBe(200);

      // Usuário B tenta excluir a coluna de A usando o ID adivinhado
      const tentativaExclusao = await request(app)
        .delete(`/colunas/${colunaA.body.id}`)
        .set("Authorization", `Bearer ${tokenB}`);

      // Deve ser bloqueado com 404 (não deve nem revelar que a coluna existe)
      expect(tentativaExclusao.status).toBe(404);

      // O card de A precisa continuar existindo
      const cardsDeA = await request(app)
        .get("/cards")
        .set("Authorization", `Bearer ${tokenA}`);

      expect(cardsDeA.body.some((c) => c.id === cardA.body.id)).toBe(true);
    }
  );

  test("usuário não consegue criar card em coluna de outro usuário", async () => {
    const colunaA = await request(app)
      .post("/colunas")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ titulo: "Outra coluna de A" });

    const tentativa = await request(app)
      .post("/cards")
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ titulo: "Card intruso", coluna_id: colunaA.body.id });

    expect(tentativa.status).toBe(404);
  });

  test("rejeita criação de card com prioridade inválida", async () => {
    const coluna = await request(app)
      .post("/colunas")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ titulo: "Coluna X" });

    const res = await request(app)
      .post("/cards")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ titulo: "Card X", coluna_id: coluna.body.id, prioridade: "urgentissimo" });

    expect(res.status).toBe(400);
  });
});
