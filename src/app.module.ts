import { Module, } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { databaseConfig } from './config';
import { models } from './DB/model.generation';
import { AdminModule, ResourceModule, UsersModule } from './modules';

@Module({
  imports: [
    SequelizeModule.forRoot(databaseConfig),
    models,
    UsersModule,
    AdminModule,
    ResourceModule,
    ThrottlerModule.forRoot([{
      ttl: 10000,
      limit: 10,
    }]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

