import { Body, Controller, Delete, Get, Post, Put, Query, Req, Res, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request, Response } from "express";
import * as Multer from "multer";
import { ResourceService } from "../services";
import { AuthGuard, multerImages, RolesGuard } from "../../Guards";
import { Role, Roles } from "../../utils";
import { CreateResource, UpdateResource } from "../../DTO";

@Controller('resource')
export class ResourceController {
    constructor(
        private readonly resourceService: ResourceService
    ) { }

    //=========================== create Resource ===========================//
    @Post('createResource')
    @UseGuards(RolesGuard)
    @UseGuards(AuthGuard)
    @Roles(Role.ADMIN)
    @UseInterceptors(FileInterceptor('image', multerImages))
    async createResource(
        @UploadedFile() file: Multer.File,
        @Req() req: Request,
        @Body() body: CreateResource,
        @Res() res: Response
    ) {
        const response = await this.resourceService.createResource(req, body, file);

        res.status(200).json({ message: 'Resource created successfully.', data: response })
    }

    //================================ delete Resource ================================//
    @Delete('deleteResource/:resourceId')
    @UseGuards(RolesGuard)
    @UseGuards(AuthGuard)
    @Roles(Role.ADMIN)
    async deleteResource(
        @Req() req: Request,
        @Res() res: Response,
    ) {
        const response = await this.resourceService.deleteResource(req);

        res.status(200).json({ message: 'Resource deleted successfully.', data: response });
    }

    //================================== update Resource ==================================//
    @Put('updateResource/:resourceId')
    @UseGuards(RolesGuard)
    @UseGuards(AuthGuard)
    @Roles(Role.ADMIN)
    @UseInterceptors(FileInterceptor('image', multerImages))
    async updateResource(
        @Req()
        req: Request, @Body()
        body: UpdateResource, @Res()
        res: Response, p0: any,
    ) {
        const response = await this.resourceService.updateResource(req, body);

        res.status(200).json({ message: 'Resource updated successfully.', data: response });
    }

    //================================== get all Resources ==================================//
    @Get('getAllResources')
    @UseGuards(RolesGuard)
    @UseGuards(AuthGuard)
    @Roles(Role.ADMIN, Role.USER)
    async getAllResources(
        @Req() req: Request,
        @Res() res: Response
    ) {
        const response = await this.resourceService.getAllResources(req);

        res.status(200).json({ message: 'All resources fetched successfully.', data: response });
    }

    //================================== search for Resources ==================================//
    @Get('searchResources')
    @UseGuards(RolesGuard)
    @UseGuards(AuthGuard)
    @Roles(Role.ADMIN, Role.USER)
    async searchResources(
        @Req() req: Request,
        @Res() res: Response
    ) {
        const response = await this.resourceService.searchForResources(req);

        res.status(200).json({ message: 'Resources fetched successfully.', data: response });
    }
}
