import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { UserService } from "../services";
import { SignInBodyDTO, SignUpBodyDTO } from "../../DTO";

@Controller('user')

export class UserController {
    constructor(
        private readonly userService: UserService
    ) { }

    //=========================== signUp ===========================//
    @Post('signUp')
    async SignUp(
        @Body() body: SignUpBodyDTO,
        @Res() res: Response
    ) {
        const response = await this.userService.SignUp(body);

        res.status(200).json({ message: 'signUp successfully.', data: response })
    }

    //=========================== signIn ===========================//
    @Post('signIn')
    async SignIn(
        @Body() body: SignInBodyDTO,
        @Res() res: Response
    ) {
        const response = await this.userService.SignIn(body);

        res.status(200).json({ message: 'signIn successfully.', data: response })
    }
}
