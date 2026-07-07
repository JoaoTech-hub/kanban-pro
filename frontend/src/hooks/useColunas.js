import { useState, useCallback } from "react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

export function useColunas(onMudanca) {
  const [salvando, setSalvando] = useState(false);
  const { showToast } = useToast();

  const criarColuna = useCallback(async (titulo) => {
    setSalvando(true);
    try {
      await api.post("/colunas", { titulo });
      await onMudanca();
      showToast("Projeto criado com sucesso.", "sucesso");
      return true;
    } catch (erro) {
      console.error(erro);
      showToast(erro.response?.data?.erro || "Erro ao criar coluna.", "erro");
      return false;
    } finally {
      setSalvando(false);
    }
  }, [onMudanca, showToast]);

  const renomearColuna = useCallback(async (id, titulo) => {
    setSalvando(true);
    try {
      await api.put(`/colunas/${id}`, { titulo });
      await onMudanca();
      showToast("Projeto renomeado com sucesso.", "sucesso");
      return true;
    } catch (erro) {
      console.error(erro);
      showToast(erro.response?.data?.erro || "Erro ao renomear coluna.", "erro");
      return false;
    } finally {
      setSalvando(false);
    }
  }, [onMudanca, showToast]);

  const excluirColuna = useCallback(async (id) => {
    setSalvando(true);
    try {
      await api.delete(`/colunas/${id}`);
      await onMudanca();
      showToast("Projeto excluído com sucesso.", "sucesso");
      return true;
    } catch (erro) {
      console.error(erro);
      showToast("Erro ao excluir coluna.", "erro");
      return false;
    } finally {
      setSalvando(false);
    }
  }, [onMudanca, showToast]);

  return { criarColuna, renomearColuna, excluirColuna, salvando };
}