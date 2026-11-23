import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './module/database/database.module';
import { InternalAccountModule } from './internal/account/account.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, InternalAccountModule],
})
export class AppModule {} 