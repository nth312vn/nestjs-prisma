import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class UpdateUserDto {
    @ApiPropertyOptional({
        example: 'John Doe',
        description: 'name of user ',
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({
        example: 'bio',
        description: 'bio of user',
    })
    @IsOptional()
    @IsString()
    bio?: string;
    @ApiPropertyOptional({ example: 'address', description: 'address of user' })
    @IsOptional()
    @IsString()
    address?: string;
    @ApiPropertyOptional({
        example: '0123456789',
        description: 'phone number of user',
    })
    @IsOptional()
    @IsPhoneNumber('VN')
    phoneNumber?: string;
}
