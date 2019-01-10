import { Body, Controller, Get, Param, HttpCode, UseFilters, LoggerService} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { HttpExceptionFilter } from '../common/http-exception.filter';

@Controller('customers')
@UseFilters(new HttpExceptionFilter())
export class CustomersController {
  constructor(private readonly customersService: CustomersService) { }

  @Get('totalMonth')
  @HttpCode(200)
  async findTotalThisMonth() {   
    const customers = await this.customersService.findTotalThisMonth();
    return customers;
  }

  @Get(':id')
  @HttpCode(200)
  async findOne(@Param('id') id) {
    const salesOrder = await this.customersService.find(id);
    return salesOrder;
  }

}