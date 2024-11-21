import fastify from 'fastify';
import cookie from '@fastify/cookie';
import { transactionsRoutes } from './routes/transactions.routes';

export const app = fastify();

app.register(cookie);
// Registra o plugin na aplicação, tendo a opçao de utilizar um pre-fixo para as rotas.
app.register(transactionsRoutes, {
  prefix: 'transactions',
});
