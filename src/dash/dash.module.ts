import { Module, Inject } from '@nestjs/common';
import { DashController } from './dash.controller';
import { DashService } from './dash.service';
import { DBModule } from '../db/db.module';
import * as r from 'rethinkdb';

@Module({
  modules: [DBModule],
  controllers: [DashController],
  providers: [DashService],
  exports: [DashService],
})
export class DashModule {}
