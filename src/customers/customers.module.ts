import { Module, Inject } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { DBModule } from '../db/db.module';
import * as r from 'rethinkdb';

@Module({
  modules: [DBModule],
  controllers: [CustomersController],
  providers: [
      CustomersService,
  ],
  exports: [CustomersService],
})
export class CustomersModule { }
