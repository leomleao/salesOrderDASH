import { Controller, Get, Query, HttpCode, UseFilters } from '@nestjs/common';
import { SalesOrdersService } from './salesorders.service';
import { HttpExceptionFilter } from '../common/http-exception.filter';
import { QueryParams } from './query-params.dto';

@Controller('salesorders')
// @UseFilters(new HttpExceptionFilter())
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  // @Get('/totals')
  // @HttpCode(200)
  // async getTotals() {
  //   const salesOrders = await this.salesOrdersService.getTotals();
  //   return salesOrders;
  // }

  @Get('/data')
  @HttpCode(200)
  async getData(@Query() query: QueryParams) {
    const data = await this.salesOrdersService.getSalesData(query);
    return data;
  }

  @Get('/update')
  @HttpCode(200)
  async updateData() {
    const salesOrder = await this.salesOrdersService.updateDash();
    return salesOrder;
  }
}
