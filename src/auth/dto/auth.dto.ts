import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';

export class RegisterDto {
    @IsNotEmpty({ message: 'Name is required' })
    @ApiProperty({ example: 'John Doe', description: 'name of user ' })
    @IsString()
    @MaxLength(255, {
        message: 'Name must be at most 255 characters long',
    })
    name?: string;
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    @IsString()
    @MaxLength(255, {
        message: 'Email must be at most 255 characters long',
    })
    @IsString()
    @ApiProperty({
        example: 'example@gmail.com',
        description: 'The unique email address of the user',
    })
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @ApiProperty({
        example: 'password123',
        description: 'The password of user',
    })
    @IsString()
    password: string;
    @IsOptional()
    @MaxLength(255, {
        message: 'Avatar URL must be at most 255 characters long',
    })
    @ApiProperty({
        example: 'https://example.com/avatar.jpg',
        description: 'The avatar URL of the user',
    })
    @IsString()
    avatar?: string;

    @IsOptional()
    @MaxLength(255, {
        message: 'Bio must be at most 255 characters long',
    })
    @ApiProperty({ example: 'This is my bio', description: 'The bio of user' })
    bio?: string;
    @IsOptional()
    @MaxLength(255, {
        message: 'Address must be at most 255 characters long',
    })
    @ApiProperty({ example: '123 Main St', description: 'The address of user' })
    address?: string;
    @IsOptional()
    @IsPhoneNumber('VN', {
        message: 'Invalid phone number format',
    })
    @MaxLength(10, {
        message: 'Phone number must be at most 10 characters long',
    })
    @ApiProperty({
        example: '0123456789',
        description: 'The phone number of user',
    })
    phoneNumber?: string;
}

export class LoginDto {
    @IsNotEmpty({ message: 'Email is required' })
    @MaxLength(255, {
        message: 'Email must be at most 255 characters long',
    })
    @IsEmail({}, { message: 'Invalid email format' })
    @ApiProperty({
        example: 'example@gmail.com',
        description: 'The email of user',
    })
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    @MaxLength(255, {
        message: 'Password must be at most 255 characters long',
    })
    @ApiProperty({
        example: 'password123',
        description: 'The password of user',
    })
    password: string;
}
export class LogoutDto {
    @IsNotEmpty({ message: 'token is required' })
    @ApiProperty({
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey',
        description: 'token of user',
    })
    @IsString()
    token: string;
}
export class RefreshTokenDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        description: 'refresh token of user',
    })
    refreshToken: string;
}
