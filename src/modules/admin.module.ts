// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { models } from '../DB/model.generation'
import { JwtService } from '@nestjs/jwt';
import { AdminService } from '../Admin/services';
import { AdminController } from '../Admin/controller';

@Module({
    imports: [models],
    providers: [AdminService, JwtService],
    controllers: [AdminController],
})
export class AdminModule { }
