require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/auth.routes");
const colunasRoutes = require("./routes/colunas.routes");
const cardsRoutes = require("./routes/cards.routes");
const perfilRoutes = require("./routes/perfil.routes");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(helmet());
app.use(
  cors({
    // Em produção, restrinja para o domínio real do frontend via
    // a variável de ambiente FRONTEND_URL (ex: https://kanban-pro.vercel.app).
    origin: process.env.FRONTEND_URL || "*",
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "OK", sistema: "Kanban API", versao: "1.0" });
});

app.use("/", authRoutes);
app.use("/colunas", colunasRoutes);
app.use("/cards", cardsRoutes);
app.use("/perfil", perfilRoutes);

// 404 para rotas não mapeadas
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

// Sempre por último: captura qualquer erro passado via next(err)
app.use(errorHandler);

module.exports = app;
