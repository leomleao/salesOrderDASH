import { Module, Inject } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { DBModule } from '../db/db.module';
import * as r from 'rethinkdb';

@Module({
  modules: [DBModule],
  controllers: [InvoicesController],
  providers: [
      InvoicesService,
  ],
  exports: [InvoicesService],
})
export class InvoicesModule { }
