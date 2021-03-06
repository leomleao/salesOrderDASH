import { NestFactory, FastifyAdapter } from '@nestjs/core';
import { join, resolve } from 'path';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/logging.interceptor';
import { LoggerService } from './common/logging.service';
import { ValidationPipe } from './common/validation.pipe';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new FastifyAdapter({ LoggerService: new LoggerService('Main') }),
  );

  app.useStaticAssets({
    root: join(__dirname, '../public'),
  });
  app.register(require('point-of-view'), {
    engine: {
      handlebars: require('handlebars'),
    },
    templates: './views',
    includeViewExtension: true,
    options: {
      filename: resolve('./views'),
    },
  });

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableCors({
    origin: '*',
  });
  // app.setViewEngine('hbs');

  await app.listen(80, '0.0.0.0');

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}
bootstrap();
