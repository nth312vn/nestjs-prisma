import { Module } from '@nestjs/common';
import { PrismaModule } from './Prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { FingerprintModule } from './fingerprint/Fingerprint.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ImageModule } from './images/image.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        FingerprintModule,
        PrismaModule,
        AuthModule,
        CloudinaryModule,
        ImageModule,
        UserModule,
        ProductModule,
    ],
})
export class AppModule {}
