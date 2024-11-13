import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    MaxLength,
    MinLength,
} from 'class-validator';

export class RegisterDto {
    @IsNotEmpty({ message: 'Name is required' })
    @ApiProperty({ example: 'John Doe', description: 'name of user ' })
    name?: string;
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    @MaxLength(255, {
        message: 'Email must be at most 255 characters long',
    })
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
    password: string;
    @IsOptional()
    @MaxLength(255, {
        message: 'Avatar URL must be at most 255 characters long',
    })
    @ApiProperty({
        example: 'https://example.com/avatar.jpg',
        description: 'The avatar URL of the user',
    })
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
