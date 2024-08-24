import { Injectable } from "@nestjs/common";
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { titleRegex } from "../utils";

@Injectable()
export class CreateResource {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    @Matches(titleRegex, {
        message: 'Title must contain at least 3 letters and less than 30 letters.'
    })
    title: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(200)
    description: string;
}

@Injectable()
export class UpdateResource {
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    @Matches(titleRegex, {
        message: 'Title must contain at least 3 letters and less than 30 letters.'
    })
    title: string;

    @IsString()
    @MinLength(3)
    @MaxLength(200)
    description: string;

    @IsString()
    oldPublicId: string
}