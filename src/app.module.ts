import { Module, Inject } from '@nestjs/common';
import { DashModule } from './dash/dash.module';
import { SalesOrdersModule } from './salesorders/salesorders.module';
import { CustomersModule } from './customers/customers.module';
import { ConfigModule } from "nestjs-config";
import { ScheduleService } from './common/schedule.service'
import { FileService } from './common/file.service'

import * as r from 'rethinkdb';
import * as path from 'path';

@Module({
	imports: [
        ConfigModule.load(path.resolve(__dirname, 'config/**/*.{ts,js}')),
        SalesOrdersModule,
        CustomersModule,
        DashModule,

    ],
    modules: [SalesOrdersModule, CustomersModule, DashModule],
    providers: [ ScheduleService, FileService],
})

export class AppModule {  }