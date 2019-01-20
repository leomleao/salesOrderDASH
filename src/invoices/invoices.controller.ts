import {
  Body,
  Controller,
  Get,
  Param,
  HttpCode,
  UseFilters,
  LoggerService,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { HttpExceptionFilter } from '../common/http-exception.filter';

@Controller('invoices')
@UseFilters(new HttpExceptionFilter())
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  // @Get('totalMonth')
  // @HttpCode(200)
  // async findTotalThisMonth() {
  //   const invoices = await this.invoicesService.findTotalThisMonth();
  //   return invoices;
  // }

  // @Get(':id')
  // @HttpCode(200)
  // async findOne(@Param('id') id) {
  //   const salesOrder = await this.invoicesService.find(id);
  //   return salesOrder;
  // }
}
