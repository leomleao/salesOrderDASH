import { Body, Controller, Get, Param, HttpCode, UseFilters, LoggerService} from '@nestjs/common';
import { SalesOrdersService } from './salesorders.service';
import { HttpExceptionFilter } from '../common/http-exception.filter';

@Controller('salesorders')
@UseFilters(new HttpExceptionFilter())
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) { }

  @Get('totalMonth')
  @HttpCode(200)
  async findTotalThisMonth() {   
    const salesOrders = await this.salesOrdersService.findTotalThisMonth();
    return salesOrders;
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id') id) {
    const salesOrder = await this.salesOrdersService.find(id);
    return salesOrder;
  }

}