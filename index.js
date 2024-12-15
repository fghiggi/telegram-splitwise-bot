import TelegramBot from './bot/telegramBot.js';

async function main() {
  const bot = new TelegramBot();
  await bot.start();
}

main();
