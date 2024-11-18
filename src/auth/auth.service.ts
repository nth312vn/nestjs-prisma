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
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                expiresIn: this.configService.get<string>(
                    'ACCESS_TOKEN_EXPIRE_TIME',
                    '15m',
                ),
            }),
            this.jwtService.signAsync(payload, {
                expiresIn: this.configService.get<string>(
                    'REFRESH_TOKEN_EXPIRE_TIME',
                    '7d',
                ),
            }),
        ]);
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
    async logout(RefreshToken: string, userId: string) {
        await this.prisma.session.delete({
            where: { token: RefreshToken, userId },
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
    async refreshAccessToken(refreshToken: string, userId: string) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            console.log(userId);
            const session = await this.prisma.session.findUnique({
                where: {
                    token: refreshToken,
                    userId,
                },
            });
            if (!session) {
                throw new NotFoundException('Session not found');
            }
            const tokenPayload = {
                userId: payload.id,
                email: payload.email,
            };
            const [accessToken, newRefreshToken] = await Promise.all([
                this.jwtService.signAsync(tokenPayload, {
                    expiresIn: this.configService.get<string>(
                        'ACCESS_TOKEN_EXPIRE_TIME',
                        '15m',
                    ),
                }),
                this.jwtService.signAsync(tokenPayload, {
                    expiresIn: this.configService.get<string>(
                        'REFRESH_TOKEN_EXPIRE_TIME',
                        '7d',
                    ),
                }),
            ]);
            await this.prisma.session.update({
                where: { token: refreshToken, userId },
                data: { token: newRefreshToken },
            });

            return { accessToken, refreshToken: newRefreshToken };
        } catch (err) {
            console.log(err);
            throw new UnauthorizedException('Invalid refresh token');
        }
    }
}
