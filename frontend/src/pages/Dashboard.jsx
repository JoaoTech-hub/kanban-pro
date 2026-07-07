import { useEffect, useMemo, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";

import { useKanban } from "../hooks/useKanban";
import { useColunas } from "../hooks/useColunas";

import PageLayout from "../components/PageLayout";
import Header from "../components/Header";
import Column from "../components/Column";
import NovaColuna from "../components/NovaColuna";
import CardFormModal from "../components/CardFormModal";
import Stats from "../components/Stats";

import { ColumnsContainer } from "../styles/DashboardStyles";

export default function Dashboard() {
  const { cards, colunas, erro, carregar, moverCard } = useKanban();
  const { criarColuna, renomearColuna, excluirColuna, salvando } = useColunas(carregar);

  const [cardSelecionado, setCardSelecionado] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [pesquisa, setPesquisa] = useState("");

  // Id do card que deve tocar a animação de "concluído" agora.
  const [cardAnimandoId, setCardAnimandoId] = useState(null);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function onDragEnd(resultado) {
  if (!resultado.destination) return;

  const cardId = Number(resultado.draggableId);
  const colunaOrigemId = Number(resultado.source.droppableId);
  const colunaDestinoId = Number(resultado.destination.droppableId);
  const ordemDestino = resultado.destination.index;

  if (colunaOrigemId !== colunaDestinoId) {
    const colunaDestino = colunas.find((c) => c.id === colunaDestinoId);
    const isDestinoConcluido = colunaDestino?.titulo.toLowerCase().includes("conclu");

    if (isDestinoConcluido) {
      setCardAnimandoId(cardId);
    }
  }

  await moverCard(cardId, colunaDestinoId, ordemDestino);
}
  function limparAnimacao(cardId) {
    setCardAnimandoId((atual) => (atual === cardId ? null : atual));
  }

  function abrirEdicao(card) {
    setCardSelecionado(card);
    setModalAberto(true);
  }

  function abrirNovaTarefa() {
    setCardSelecionado(null);
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setCardSelecionado(null);
  }

  // Agrupa os cards já filtrados pela busca, uma única vez por render,
  // em vez de rodar um .filter() extra para cada coluna no JSX.
  const cardsPorColuna = useMemo(() => {
    const filtrados = cards.filter((card) =>
      card.titulo.toLowerCase().includes(pesquisa.toLowerCase())
    );
    const mapa = {};
    for (const card of filtrados) {
      (mapa[card.coluna_id] ??= []).push(card);
    }
    return mapa;
  }, [cards, pesquisa]);

  return (
    <PageLayout>
      <Header
        pesquisa={pesquisa}
        setPesquisa={setPesquisa}
        abrirNovaTarefa={abrirNovaTarefa}
      />

      <Stats cards={cards} colunas={colunas} />

      {erro && (
        <p style={{ color: "#ef4444", marginTop: 20 }} role="alert">{erro}</p>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <ColumnsContainer>
          {colunas.map((coluna) => (
            <Column
              key={coluna.id}
              coluna={coluna}
              cards={cardsPorColuna[coluna.id] ?? []}
              onEditar={abrirEdicao}
              onRenomear={renomearColuna}
              onExcluir={excluirColuna}
              cardAnimandoId={cardAnimandoId}
              onAnimacaoFim={limparAnimacao}
            />
          ))}

          <NovaColuna onCriar={criarColuna} salvando={salvando} />
        </ColumnsContainer>
      </DragDropContext>

      {modalAberto && (
        <CardFormModal
          key={cardSelecionado?.id ?? "novo"}
          fechar={fecharModal}
          card={cardSelecionado}
          colunas={colunas}
          atualizarCards={carregar}
        />
      )}
    </PageLayout>
  );
}
