import { Controller, Get, Render } from '@nestjs/common';

@Controller()
export class DashController {
	
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
}
