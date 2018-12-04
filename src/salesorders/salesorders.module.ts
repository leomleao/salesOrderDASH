import { Module } from '@nestjs/common';
import { SalesOrdersController } from './salesorders.controller';
import { SalesOrdersService } from './salesorders.service';
import { DBModule } from '../db/db.module';

@Module({
  modules: [DBModule],
  controllers: [SalesOrdersController],
  providers: [
      SalesOrdersService,
  ],
  exports: [SalesOrdersService],
})
export class SalesOrdersModule {}
