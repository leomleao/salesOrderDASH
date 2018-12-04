import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) { }

  @Get()
  @Render('index')
  root() {  	
	let today = new Date().toLocaleString('pt-BR', { timeZone:"America/Sao_Paulo" });

	let response = { message: today, totalSalesOrders: this.appService.totalSalesOrders };
	
    return response;
  }
}
