import { Telegraf, Markup, session, Scenes } from 'telegraf';
import { TELEGRAM_BOT_TOKEN } from '../config.js';
import { calculateDebtsCommand } from '../commands/calculateDebts.js';
import { addExpenseCommand, addExpenseScene } from '../commands/addExpense.js';

class TelegramBot {
  constructor() {
    this.bot = new Telegraf(TELEGRAM_BOT_TOKEN);

    Markup.removeKeyboard(true);

    this.registerMiddlewares();
    this.registerCommands();
  }

  registerMiddlewares() {
    this.bot.use(session());

    const stage = new Scenes.Stage([addExpenseScene]);
    this.bot.use(stage.middleware());
  }

  registerCommands() {
    this.bot.hears('📋 Listar itens', calculateDebtsCommand);
    this.bot.hears('➕ Adicionar item', addExpenseCommand);
  }

  async start() {
    try {
      await this.bot.launch(() => console.log('Bot iniciado e ouvindo comandos...'));
    } catch (error) {
      console.error('Erro ao iniciar o bot:', error);
    }

    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));    
  }
}

export default TelegramBot;
