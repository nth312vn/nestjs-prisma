import {
    Body,
    Controller,
    Headers,
    HttpCode,
    HttpStatus,
    Post,
    UseFilters,
    UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto/auth.dto';
import { Fingerprint, IFingerprint } from 'nestjs-fingerprint';
import { User } from 'src/decorator/user.decorator';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UserDecoratorData } from 'src/types/auth';
import { PrismaExceptionFilter } from 'src/exceptions/PrismaException.exception';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        await this.authService.register(registerDto);
        return {
            message: 'register successfully',
        };
    }
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(
        @Body() loginDto: LoginDto,
        @Fingerprint() fp: IFingerprint,
        @Headers() headers: Headers,
    ) {
        const userAgent = headers['user-agent'];
        return this.authService.login(loginDto, fp, userAgent);
    }
    @Post('refresh-token')
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshAccessToken(
            refreshTokenDto.refreshToken,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @UseFilters(new PrismaExceptionFilter())
    @ApiBearerAuth('JWT-auth')
    async logout(
        @User() user: UserDecoratorData,
        @Fingerprint() fp: IFingerprint,
    ) {
        await this.authService.logout(user.userId, fp);
        return {
            message: 'logout successfully',
        };
    }
}
