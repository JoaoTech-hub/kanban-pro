const request = require("supertest");
const app = require("../src/app");

describe("Autenticação", () => {
  const usuario = {
    nome: "Maria Teste",
    usuario: `maria_${Date.now()}`,
    senha: "senha123",
  };

  test("cria uma conta nova com sucesso", async () => {
    const res = await request(app).post("/registro").send(usuario);
    expect(res.status).toBe(200);
  });

  test("não permite registrar o mesmo usuário duas vezes", async () => {
    const res = await request(app).post("/registro").send(usuario);
    expect(res.status).toBe(400);
  });

  test("faz login com credenciais corretas e recebe um token", async () => {
    const res = await request(app).post("/login").send({
      usuario: usuario.usuario,
      senha: usuario.senha,
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  test("rejeita login com senha errada", async () => {
    const res = await request(app).post("/login").send({
      usuario: usuario.usuario,
      senha: "senhaErrada",
    });
    expect(res.status).toBe(401);
  });

  test("rejeita registro com senha curta demais", async () => {
    const res = await request(app).post("/registro").send({
      nome: "Fulano",
      usuario: `fulano_${Date.now()}`,
      senha: "123",
    });
    expect(res.status).toBe(400);
  });

  test("bloqueia acesso a rota protegida sem token", async () => {
    const res = await request(app).get("/colunas");
    expect(res.status).toBe(401);
  });
});
