import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class DashController {
	
  @Get()
  @Render('index')
  root() {  	
	let today = new Date().toLocaleString('pt-BR', { timeZone:"America/Sao_Paulo" });

	let response = { message: today};
	
    return response;
  }
}
