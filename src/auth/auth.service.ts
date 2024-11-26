import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/Prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { IFingerprint } from 'nestjs-fingerprint';
import { PayloadToken } from 'src/types/auth.type';

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
    async login(data: LoginDto, fp: IFingerprint, userAgent: string) {
        const { email, password } = data;
        const user = await this.validateUser(email, password);
        if (!user) {
            throw new UnauthorizedException('Email or password is incorrect.');
        }
        const payload = { email: user.email, id: user.id };

        const [accessToken, refreshToken] = await this.generateToken(payload);
        await this.prisma.session.create({
            data: {
                userId: user.id,
                token: refreshToken,
                fingerprint: fp.id,
                ip: fp.ipAddress.value,
                userAgent: userAgent,
            },
        });

        return {
            accessToken,
            refreshToken,
        };
    }
    async logout(userId: string, fp: IFingerprint) {
        await this.prisma.session.deleteMany({
            where: { fingerprint: fp.id, userId: userId },
        });
    }
    async validateUser(email: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('User not found.');
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            throw new UnauthorizedException('User or password');
        }

        return user;
    }
    async refreshAccessToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const session = await this.prisma.session.findUnique({
                where: {
                    token: refreshToken,
                    userId: payload.id,
                },
            });
            if (!session) {
                throw new NotFoundException('Session not found');
            }
            const tokenPayload = {
                id: payload.id,
                email: payload.email,
            };
            const [accessToken, newRefreshToken] =
                await this.generateToken(tokenPayload);
            await this.prisma.session.update({
                where: { token: refreshToken, userId: payload.id },
                data: { token: newRefreshToken },
            });

            return { accessToken, refreshToken: newRefreshToken };
        } catch (err) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
    generateToken(payload: PayloadToken) {
        return Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: this.configService.get<string>(
                    'ACCESS_TOKEN_EXPIRE_TIME',
                    '1m',
                ),
            }),
            this.jwtService.signAsync(payload, {
                expiresIn: this.configService.get<string>(
                    'REFRESH_TOKEN_EXPIRE_TIME',
                    '7d',
                ),
            }),
        ]);
    }
}
