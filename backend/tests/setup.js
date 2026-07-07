// Roda antes de cada arquivo de teste: garante que os testes nunca
// tocam no kanban.db real de desenvolvimento, e que sempre existe um
// JWT_SECRET válido (mesmo que o .env não esteja configurado no CI).
process.env.DB_PATH = ":memory:";
process.env.JWT_SECRET = process.env.JWT_SECRET || "segredo-de-teste-nao-usar-em-producao";
process.env.NODE_ENV = "test";
