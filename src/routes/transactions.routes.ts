import { FastifyInstance } from 'fastify';
import { knex } from '../database';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { checkSessionIdExists } from '../middlewares/check-session-id-exists';

export async function transactionsRoutes(app: FastifyInstance) {
  // preHandler age como um middleware para a nossa rota
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies;

    const transactions = await knex('transactions').where('session_id', sessionId).select('*');

    // Utilização de retorno com objetos para poder facilitar a adição de futuros retornos
    return { transactions };
  });

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
    const getTransactionsParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionsParamsSchema.parse(request.params);

    const { sessionId } = request.cookies;

    const transaction = await knex('transactions').where({ id, session_id: sessionId }).first();

    return { transaction };
  });

  app.get('/summary', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies;

    const summary = await knex('transactions').where('session_id', sessionId).sum('amount', { as: 'amount' }).first();

    return { summary };
  });

  app.post('/', async (response, reply) => {
    // Cria schema para o body da requisiçao vinda do front
    const createTransactionSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    });

    // Utiliza um parse no body e desestrutura o mesmo
    // Caso ocorra algum erro o proprio zod da um throw Error
    const { title, amount, type } = createTransactionSchema.parse(response.body);

    let sessionId = response.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      });
    }

    // Insere os valores no banco
    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
}
