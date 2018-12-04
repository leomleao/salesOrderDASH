import { Module } from '@nestjs/common';

import { DashModule } from './dash/dash.module';
import { SalesOrdersModule } from './salesorders/salesorders.module';

@Module({
    modules: [DashModule, SalesOrdersModule],
})

export class AppModule {}