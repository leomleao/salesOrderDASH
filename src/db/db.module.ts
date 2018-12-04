import { Module } from '@nestjs/common';
import * as r from 'rethinkdb';

const dbProvider = {
  provide: 'rethinkDB',
  useValue: r.connect({ host: 'localhost', port: 28015 }),
};

@Module({
  components: [dbProvider],
  exports: [dbProvider],
})
export class DBModule { }
