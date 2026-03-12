import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [join(process.cwd(), '.env.local'), join(process.cwd(), '.env')],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
