import { Module, Inject } from '@nestjs/common';
import { DashModule } from './dash/dash.module';
import { SalesOrdersModule } from './salesorders/salesorders.module';
import { CustomersModule } from './customers/customers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ConfigModule } from 'nestjs-config';
import { ScheduleService } from './common/schedule.service';
import { FilesService } from './common/files.service';

import * as r from 'rethinkdb';
import * as path from 'path';

@Module({
  imports: [
    ConfigModule.load(path.resolve(__dirname, 'config/**/*.{ts,js}')),
    SalesOrdersModule,
    CustomersModule,
    DashModule,
    InvoicesModule,
  ],
  modules: [SalesOrdersModule, CustomersModule, DashModule, InvoicesModule],
  providers: [ScheduleService, FilesService],
})
export class AppModule {}
