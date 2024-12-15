import { Scenes, Markup } from 'telegraf';
import { addExpenseToDatabase, addUserToDatabase } from '../services/expenseService.js';

const addExpenseScene = new Scenes.WizardScene(
  'ADD_ITEM',
  (ctx) => {
    ctx.reply('Qual é o nome da despesa?');
    return ctx.wizard.next();
  },
  (ctx) => {
    ctx.scene.state.nome = ctx.message.text;
    ctx.reply('Agora envie o valor no formato: XX,XX\n\nExemplo: 10,50');
    return ctx.wizard.next();
  },
  async (ctx) => {
    const valorInput = ctx.message.text;

    const valorMatch = valorInput.match(/^(\d+),(\d{2})$/);
    if (!valorMatch) {
      return ctx.reply('Formato inválido! Envie o valor no formato correto: XX,XX\n\nExemplo: 10,50');
    }

    const grupoId = ctx.message.chat.id;
    const usuarioId = ctx.message.from.id;
    const nomeUsuario = ctx.message.from.first_name;
    const valor = parseFloat(valorMatch[1] + '.' + valorMatch[2]);
    const descricao = ctx.scene.state.nome;

    await addUserToDatabase(usuarioId, nomeUsuario)

    const despesa = await addExpenseToDatabase(grupoId, usuarioId, valor, descricao);

    if (!despesa) {
      return ctx.reply('Erro ao registrar a despesa. Tente novamente.');
    }

    ctx.reply(
      `✅ Despesa adicionada:\n${ctx.scene.state.nome} - R$ ${valor.toFixed(2).replace('.', ',')}`,
      Markup.keyboard([['📋 Listar itens'], ['➕ Adicionar item']])
        .resize()
        .persistent()
    );

    return ctx.scene.leave();
  }
);

async function addExpenseCommand(ctx) {
  ctx.scene.enter('ADD_ITEM');
}

export { addExpenseCommand, addExpenseScene };
