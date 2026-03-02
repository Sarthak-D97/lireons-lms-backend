import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Change 3000 to 3001 for the worker
  await app.listen(process.env.PORT ?? 3002); 
}
bootstrap();