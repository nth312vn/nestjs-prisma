import { Injectable, NotFoundException } from '@nestjs/common';
import { ImageService } from 'src/images/image.service';
import { PrismaService } from 'src/Prisma/prisma.service';
import { CreateProductDto } from './dto/product.dto';
import { ImageFolder } from 'src/constants/imageFolder.constant';
import { PaginationDto } from 'src/dto/pagination.dto';
import { paginationFormat } from 'src/utils/pagination.utils';

@Injectable()
export class ProductService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly imageService: ImageService,
    ) {}
    async createProduct(
        createProductDto: CreateProductDto,
        userId: string,
        file?: Express.Multer.File,
    ) {
        let imageUrl = null;
        let imagePublicId = null;
        if (file) {
            const uploadResult = await this.imageService.uploadImage(
                file,
                ImageFolder.PRODUCT,
            );
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }
        return this.prismaService.product.create({
            data: {
                name: createProductDto.name,
                description: createProductDto.description,
                price: createProductDto.price,
                image: imageUrl,
                imagePublicId,
                userId,
            },
        });
    }
    async getProducts(pagination: PaginationDto) {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;

        const [total, products] = await Promise.all([
            this.prismaService.product.count(),
            this.prismaService.product.findMany({
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
        ]);
        return paginationFormat(products, {
            total,
            totalPage: Math.ceil(total / limit),
            page,
            limit,
        });
    }
    findOne(id: string) {
        return this.prismaService.product.findUnique({ where: { id } });
    }
    async remove(id: string, userId: string) {
        const product = await this.prismaService.product.findUnique({
            where: { id, userId },
        });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (product.imagePublicId) {
            await this.imageService.deleteImage(product.imagePublicId);
        }

        return this.prismaService.product.delete({ where: { id, userId } });
    }
    async update(
        id: string,
        data: Partial<CreateProductDto>,
        userId: string,
        file?: Express.Multer.File,
    ) {
        const product = await this.prismaService.product.findUnique({
            where: { id, userId },
        });
        let imageUrl = product.image;
        let imagePublicId = product.imagePublicId;

        if (!product) {
            throw new NotFoundException('Product not found');
        }
        if (file) {
            if (imagePublicId) {
                await this.imageService.deleteImage(imagePublicId);
            }

            const uploadResult = await this.imageService.uploadImage(
                file,
                ImageFolder.PRODUCT,
            );
            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
        }

        return this.prismaService.product.update({
            where: { id, userId },
            data: {
                ...data,
                image: imageUrl,
                imagePublicId,
            },
        });
    }
}
