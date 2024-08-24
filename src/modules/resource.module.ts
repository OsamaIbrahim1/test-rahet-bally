import { Module } from '@nestjs/common';
import { models } from '../DB/model.generation'
import { JwtService } from '@nestjs/jwt';
import { ResourceController } from '../Resource/controller';
import { ResourceService } from '../Resource/services';

@Module({
    imports: [models],
    providers: [ResourceService, JwtService],
    controllers: [ResourceController],
})
export class ResourceModule { }
