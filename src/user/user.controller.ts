import {
    Body,
    Controller,
    Get,
    Patch,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { User } from 'src/decorator/user.decorator';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { UserDecoratorData } from 'src/types/auth.type';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerAvatarConfig } from 'src/config/multer.config';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}
    @Get('me')
    getMe(@User() user: UserDecoratorData) {
        return this.userService.getMe(user.userId);
    }
    @Patch('me')
    updateUser(@User() user: UserDecoratorData, @Body() data: UpdateUserDto) {
        return this.userService.updateUser(user.userId, data);
    }
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        description: 'File to upload',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @Patch('me/avatar')
    @UseInterceptors(FileInterceptor('file', multerAvatarConfig))
    updateAvatar(
        @User() user: UserDecoratorData,
        @UploadedFile() file: Express.Multer.File,
    ) {
        return this.userService.updateAvatar(user.userId, file);
    }
}
