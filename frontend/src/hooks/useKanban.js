import { useState, useCallback } from "react";
import api from "../services/api";

export function useKanban() {
  const [cards, setCards] = useState([]);
  const [colunas, setColunas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [resColunas, resCards] = await Promise.all([
        api.get("/colunas"),
        api.get("/cards"),
      ]);
      setColunas(resColunas.data);
      setCards(resCards.data);
    } catch (e) {
      console.error(e);
      setErro("Falha ao carregar dados. Verifique sua conexão.");
    } finally {
      setCarregando(false);
    }
  }, []);

  const moverCard = useCallback(async (cardId, colunaDestino, ordemDestino) => {
    // Otimismo: atualiza estado local imediatamente
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? { ...c, coluna_id: colunaDestino, ordem: ordemDestino }
          : c
      )
    );
    try {
      await api.put(`/cards/${cardId}/mover`, {
        coluna_id: colunaDestino,
        ordem: ordemDestino,
      });
    } catch (e) {
      console.error(e);
      // Reverte em caso de falha
      await carregar();
    }
  }, [carregar]);

  return { cards, colunas, carregando, erro, carregar, moverCard };
}
