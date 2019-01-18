import { Module, Inject } from '@nestjs/common';
import { SalesOrdersController } from './salesorders.controller';
import { SalesOrdersService } from './salesorders.service';
import { DBModule } from '../db/db.module';
import * as r from 'rethinkdb';

@Module({
  modules: [DBModule],
  controllers: [SalesOrdersController],
  providers: [
      SalesOrdersService,
  ],
  exports: [SalesOrdersService],
})
export class SalesOrdersModule { }
