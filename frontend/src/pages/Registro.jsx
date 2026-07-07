import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  PageWrapper,
  Card,
  Title,
  Subtitle,
  Input,
  SubmitButton,
  ErrorMsg,
  FooterLink,
} from "../styles/AuthStyles";

export default function Registro() {
  const [nome, setNome] = useState("");
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function registrar(e) {
    e.preventDefault();
    setErro("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setCarregando(true);
    try {
      await api.post("/registro", { nome, usuario, senha });
      // Após criar a conta, já faz login automaticamente para
      // não obrigar o usuário a digitar tudo de novo.
      const resposta = await api.post("/login", { usuario, senha });
      login(resposta.data.token, resposta.data.nome);
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao criar conta. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <PageWrapper>
      <Card>
        <div>
          <Title>🚀 Kanban Pro</Title>
          <Subtitle>Crie sua conta para começar a organizar suas tarefas</Subtitle>
        </div>

        <form onSubmit={registrar} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            autoComplete="name"
            required
          />
          <Input
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
            required
          />
          <Input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="new-password"
            required
          />
          <Input
            type="password"
            placeholder="Confirmar senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            autoComplete="new-password"
            required
          />
          {erro && <ErrorMsg role="alert">{erro}</ErrorMsg>}
          <SubmitButton type="submit" disabled={carregando}>
            {carregando ? "Criando conta..." : "Criar conta"}
          </SubmitButton>
        </form>

        <FooterLink>
          Já tem conta?{" "}
          <button type="button" onClick={() => navigate("/")}>
            Entrar
          </button>
        </FooterLink>
      </Card>
    </PageWrapper>
  );
}
