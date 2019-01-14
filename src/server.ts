import { NestFactory, FastifyAdapter  } from '@nestjs/core';
import { join, resolve } from 'path';
import { AppModule } from './app.module';
import { WsAdapter } from '@nestjs/websockets/adapters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new FastifyAdapter());

  app.useStaticAssets({
        root: join(__dirname, '../public')
    })
  app.register(require('point-of-view'),{
  	engine: {
  		handlebars: require('handlebars')
  	},
  	templates: './views',
  	includeViewExtension: true,
	options: {
	    filename: resolve('./views')
	},
  })
  // app.setViewEngine('hbs');  


  await app.listen(80, '0.0.0.0');
}
bootstrap();
