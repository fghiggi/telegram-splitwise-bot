import supabase from '../database/supabaseClient.js';

export async function addUserToDatabase(telegramId, nome) {
  const { data, error } = await supabase
    .from('usuarios')
    .upsert([{ telegram_id: telegramId, nome }], { onConflict: 'telegram_id' });

  if (error) {
    console.error('Erro ao adicionar usuário:', error);
    return null;
  }
  return data;
}

export async function addExpenseToDatabase(grupoId, telegramId, valor, descricao) {
   const { data: saldos, error: saldosError } = await supabase
   .from('saldos')
   .select('usuario_id, saldo')
   .eq('grupo_id', grupoId);

 if (saldosError) {
   console.error('Erro ao buscar saldos no grupo:', saldosError);
   return;
 }

 const valorPorPessoa = valor / (saldos.length + 1);

 for (const saldo of saldos) {
   const novoSaldo =
     saldo.usuario_id === telegramId
       ? saldo.saldo + valor - valorPorPessoa
       : saldo.saldo - valorPorPessoa;

   const { error: updateError } = await supabase
     .from('saldos')
     .upsert({
       grupo_id: grupoId,
       usuario_id: saldo.usuario_id,
       saldo: novoSaldo
     });

   if (updateError) {
     console.error(`Erro ao atualizar saldo para usuário ${saldo.usuario_id}:`, updateError);
   }
 }

 const { error: saldoError } = await supabase
   .from('saldos')
   .upsert({
     grupo_id: grupoId,
     usuario_id: telegramId,
     saldo: valor - valorPorPessoa
   });

 if (saldoError) {
   console.error('Erro ao registrar saldo inicial:', saldoError);
 }

 const { data, error } = await supabase
   .from('despesas')
   .insert([{ grupo_id: grupoId, usuario_id: telegramId, valor, descricao }]);

 if (error) {
   console.error('Erro ao adicionar despesa:', error);
   return null;
 }
 return data;
}

export async function calculateDebts(grupoId) {
  const { data: saldos, error } = await supabase
  .from('saldos')
  .select('usuario_id, saldo')
  .eq('grupo_id', grupoId);

if (error) {
  console.error('Erro ao buscar saldos dos usuários no grupo:', error);
  return;
}

const { data: usuarios } = await supabase
  .from('usuarios')
  .select('telegram_id, nome');

const usuariosMap = Object.fromEntries(usuarios.map(u => [u.telegram_id, u.nome]));

const devedores = saldos.filter((u) => u.saldo < 0).map((u) => ({ ...u, nome: usuariosMap[u.usuario_id] }));
const credores = saldos.filter((u) => u.saldo > 0).map((u) => ({ ...u, nome: usuariosMap[u.usuario_id] }));

const divisoes = [];
for (const devedor of devedores) {
  for (const credor of credores) {
    const valor = Math.min(-devedor.saldo, credor.saldo);
    if (valor > 0) {
      divisoes.push({
        devedor: devedor.nome,
        credor: credor.nome,
        valor,
      });

      devedor.saldo += valor;
      credor.saldo -= valor;
    }
  }
}

return divisoes;
}
