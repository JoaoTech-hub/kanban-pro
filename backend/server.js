require("dotenv").config();
const app = require("./src/app");

const PORTA = process.env.PORT || 3001;

if (!process.env.JWT_SECRET) {
  console.error("ERRO: defina JWT_SECRET no arquivo .env antes de iniciar o servidor.");
  process.exit(1);
}

app.listen(PORTA, () => {
  console.log(`Backend rodando em http://localhost:${PORTA}`);
});
