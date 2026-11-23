import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions } from '@nestjs/microservices';
import { kafkaOptionsFactory } from './config/kafka/kafka.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  await app.setGlobalPrefix(config.get<string>('HTTP_PREFIX', '/api/transaction'));

  //установка соединения с Kafka
  app.connectMicroservice<MicroserviceOptions>(kafkaOptionsFactory());

  //настройка Swagger
  const configSwagger = new DocumentBuilder()
    .setTitle(`${config.get('SERVICE_NAME')} microservice`)
    .setDescription('API Documentation')
    .addServer(`http://${config.get('HTTP_HOST')}:${config.get('HTTP_PORT')}${config.get('HTTP_PREFIX')}`)
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup(`${config.get('HTTP_PREFIX')}/docs`, app, document);

  //подписка на брокер сообщений
  await app.startAllMicroservices();
  await app.listen(config.get<number>('HTTP_PORT', 9002));
}
bootstrap();