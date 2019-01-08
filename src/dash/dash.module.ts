import { Module } from '@nestjs/common';
import { DashController } from './dash.controller';
import { DashService } from './dash.service';
import { DBModule } from '../db/db.module';

@Module({
  modules: [DBModule],
  controllers: [DashController],
  providers: [
      DashService,
  ],
  exports: [DashService],
})
export class DashModule {}
