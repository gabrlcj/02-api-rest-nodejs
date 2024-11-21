// A propria documentaçao do knex instrui a fazer esta alteração para refletir
// as tabelas criadas dentro da aplicação, tendo assim a tipagem do Typescript.

import { Knex } from 'knex';

declare module 'knex/types/tables' {
  export interface Tables {
    transactions: {
      id: string;
      title: string;
      amount: number;
      created_at: string;
      session_id?: string;
    };
  }
}
