import { Module } from '@nestjs/common';
import { DashController } from './dash.controller';

@Module({
  imports: [],
  controllers: [DashController],
})
export class DashModule {}
