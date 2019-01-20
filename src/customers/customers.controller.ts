import { Body, Controller, Get, Param, HttpCode, UseFilters, LoggerService} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { HttpExceptionFilter } from '../common/http-exception.filter';

@Controller('customers')
@UseFilters(new HttpExceptionFilter())
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

}