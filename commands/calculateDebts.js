import { calculateDebts } from '../services/expenseService.js';

async function calculateDebtsCommand(ctx) {
  const grupoId = ctx.message.chat.id;

  const divisoes = await calculateDebts(grupoId);

  if (!divisoes || divisoes.length === 0) {
    ctx.reply('Não há dívidas neste grupo.');
    return;
  }

  const resposta = divisoes.map((divisao) => (
    `💸 ${divisao.devedor} deve R$${divisao.valor.toFixed(2)} para ${divisao.credor}`
  )).join('\n');

  ctx.reply(resposta);
}

export { calculateDebtsCommand };
