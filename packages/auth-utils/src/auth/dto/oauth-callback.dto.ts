import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class OAuthCallbackDto {
    @IsString()
    @IsNotEmpty()
    provider: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    name: string;
}
