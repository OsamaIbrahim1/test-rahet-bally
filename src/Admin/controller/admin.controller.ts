import { Body, Controller, Get, Post, Res } from "@nestjs/common";
import { SignInBodyDTO, SignUpBodyDTO } from "../../DTO";
import { AdminService } from "../services";
import { Response } from "express";

@Controller('admin')

export class AdminController {
    constructor(
        private readonly adminService: AdminService
    ) { }

    //=========================== signUp ===========================//
    @Post('signUp')
    async SignUp(
        @Body() body: SignUpBodyDTO,
        @Res() res: Response
    ) {
        const response = await this.adminService.SignUp(body);

        res.status(200).json({ message: 'signUp successfully.', data: response })
    }

    //=========================== signIn ===========================//
    @Post('signIn')
    async SignIn(
        @Body() body: SignInBodyDTO,
        @Res() res: Response
    ) {
        const response = await this.adminService.SignIn(body);

        res.status(200).json({ message: 'signIn successfully.', data: response })
    }

}
