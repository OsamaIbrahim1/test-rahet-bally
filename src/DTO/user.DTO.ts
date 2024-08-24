import { Injectable } from "@nestjs/common";
import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { emailRegex, passwordRegex } from "../utils";



@Injectable()
export class SignUpBodyDTO {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    name: string;

    @IsNotEmpty()
    @IsEmail()
    @Matches(emailRegex, {
        message: 'Invalid email, please provide a valid email'
    })
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(15)
    @IsNotEmpty()
    @Matches(passwordRegex, {
        message: 'Invalid password, must contain at least one uppercase letter, one lowercase letter, one number, one special character and at least 8 characters long, to be strong'
    })
    password: string;

    @IsString()
    @IsNotEmpty()
    role: string;
}

@Injectable()
export class SignInBodyDTO {
    @IsNotEmpty()
    @IsEmail()
    @Matches(emailRegex, {
        message: 'Invalid email, please provide a valid email'
    })
    email: string;

    @IsString()
    @MinLength(6)
    @MaxLength(15)
    @IsNotEmpty()
    @Matches(passwordRegex, {
        message: 'Invalid password, must contain at least one uppercase letter, one lowercase letter, one number, one special character and at least 8 characters long, to be strong'
    })
    password: string;
}