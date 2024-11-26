import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { ImageService } from 'src/images/image.service';
import { PrismaService } from 'src/Prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly imageService: ImageService,
    ) {}
    getMe(userId: string) {
        return this.prisma.user.findUnique({
            where: { id: userId },
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
    updateUser(userId: string, data: Partial<User>) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                bio: true,
                address: true,
                phoneNumber: true,
            },
        });
    }
    async updateAvatar(userId: string, file: Express.Multer.File) {
        if (!file) {
            throw new NotFoundException('File not found.');
        }
        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { avatarPublicId: true, id: true },
        });
        if (!existingUser) throw new NotFoundException('User not found.');
        if (existingUser.avatarPublicId) {
            await this.imageService.deleteImage(existingUser.avatarPublicId);
        }
        const result = await this.imageService.uploadImage(file, 'avatar', {
            allowed_formats: ['jpg', 'jpeg', 'png'],
        });
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                avatar: result.secure_url,
                avatarPublicId: result.public_id,
            },
            select: { avatar: true },
        });
    }
}
