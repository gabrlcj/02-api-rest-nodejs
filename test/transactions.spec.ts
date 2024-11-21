import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { execSync } from 'node:child_process';
import { app } from '../src/app';

// Exemplo de testes e2e => Testes que vão de uma ponta a outra
describe('Transactions routes', () => {
  // Método para esperar aplicação subir antes dos testes
  beforeAll(async () => {
    await app.ready();
  });

  // Método para finalizar a aplicação depois dos testes
  afterAll(async () => {
    await app.close();
  });

  // Gerar um ambiente novo toda vez que for rodar um teste, para nao acontecer de um falso positivo ou falso negativo
  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New Transactions',
        amount: 5000,
        type: 'credit',
      })
      .expect(201);
  });

  it('should be able to list all the transactions', async () => {
    const createTransactionResponse = await request(app.server).post('/transactions').send({
      title: 'New Transactions',
      amount: 5000,
      type: 'credit',
    });

    const cookies = createTransactionResponse.get('Set-Cookie');

    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies ?? [''])
      .expect(200);

    expect(listTransactionResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New Transactions',
        amount: 5000,
      }),
    ]);
  });

  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server).post('/transactions').send({
      title: 'New Transactions',
      amount: 5000,
      type: 'credit',
    });

    const cookies = createTransactionResponse.get('Set-Cookie');

    const listTransactionResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies ?? [''])
      .expect(200);

    const transactionId = listTransactionResponse.body.transactions[0].id;

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies ?? [''])
      .expect(200);

    expect(getTransactionResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New Transactions',
        amount: 5000,
      })
    );
  });

  it('should be able to get the summary', async () => {
    const createTransactionResponse = await request(app.server).post('/transactions').send({
      title: 'Credit Transactions',
      amount: 5000,
      type: 'credit',
    });

    const cookies = createTransactionResponse.get('Set-Cookie');

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies ?? [''])
      .send({
        title: 'Debit Transactions',
        amount: 2000,
        type: 'debit',
      });

    const summaryTransactionResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies ?? [''])
      .expect(200);

    expect(summaryTransactionResponse.body.summary).toEqual(
      expect.objectContaining({
        amount: 3000,
      })
    );
  });
});
