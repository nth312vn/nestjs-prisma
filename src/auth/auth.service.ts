import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) {}
    async register(data: RegisterDto) {
        const { email, password, name, avatar, bio, address, phoneNumber } =
            data;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new BadRequestException('Email is already registered.');
        }
        const hashedPassword = await bcrypt.hash(
            password,
            Number(this.configService.get<number>('SALT_ROUND', 10)),
        );
        return this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
                avatar: avatar || null,
                bio: bio || null,
                address: address || null,
                phoneNumber: phoneNumber || null,
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                bio: true,
                address: true,
                phoneNumber: true,
            },
        });
    }
    async login(data: LoginDto) {
        const { email, password } = data;
        const user = await this.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException('Email or password is incorrect.');
        }
        const payload = { email: user.email, id: user.id };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get<string>(
                'ACCESS_TOKEN_EXPIRE_TIME',
                '15m',
            ),
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get<string>(
                'REFRESH_TOKEN_EXPIRE_TIME',
                '7d',
            ),
        });
        return {
            accessToken,
            refreshToken,
        };
    }
    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('Invalid credentials.');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new UnauthorizedException('Invalid credentials.');
        }

        return user;
    }
    refreshAccessToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const accessToken = this.jwtService.sign(
                { email: payload.email, sub: payload.sub },
                { expiresIn: '15m' },
            );
            return { accessToken };
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}
