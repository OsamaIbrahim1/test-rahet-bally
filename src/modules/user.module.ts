// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UserService } from '../User/services'
import { UserController } from '../User/controller'
import { models } from '../DB/model.generation'
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [models],
    providers: [UserService, JwtService],
    controllers: [UserController],
})
export class UsersModule { }
