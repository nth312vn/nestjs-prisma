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
import {
    LoginDto,
    LogoutDto,
    RefreshTokenDto,
    RegisterDto,
} from './dto/auth.dto';
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
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth')
    @Post('refresh-token')
    async refreshToken(
        @Body() refreshTokenDto: RefreshTokenDto,
        @User() user: UserDecoratorData,
    ) {
        return this.authService.refreshAccessToken(
            refreshTokenDto.refreshToken,
            user.userId,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    @UseFilters(new PrismaExceptionFilter())
    @ApiBearerAuth('JWT-auth')
    async logout(
        @Body() logoutDto: LogoutDto,
        @User() user: UserDecoratorData,
    ) {
        await this.authService.logout(logoutDto.token, user.userId);
        return {
            message: 'logout successfully',
        };
    }
}
