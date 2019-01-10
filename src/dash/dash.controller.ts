import { Controller, Get, Render, HttpCode, UseFilters } from '@nestjs/common';
import { DashService } from './dash.service';
import { HttpExceptionFilter } from '../common/http-exception.filter';

@Controller()
@UseFilters(new HttpExceptionFilter())
export class DashController {
	constructor(private readonly dashService: DashService) { }
	
  @Get()
  @Render('index')
  root() {  	
  	const monthNames = ["janeiro", "fevereiro", "marco", "abril", "maio", "junho",
	  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
	];

  	const today = new Date();
  	const response = { 
		message: today.toLocaleString('pt-BR', { timeZone:"America/Sao_Paulo" }),
		currentYear: today.getFullYear(),
		currentMonth: monthNames[today.getMonth()],
	};
	
    return response;
  }

  @Get('dash/update')
  @HttpCode(200)
  async getNewData() {   
    const data = await this.dashService.getNewData();
    return data;
  }

}
