import { Module } from '@nestjs/common';
import { PrismaModule } from './Prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { FingerprintModule } from './fingerprint/Fingerprint.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        FingerprintModule,
        PrismaModule,
        AuthModule,
    ],
})
export class AppModule {}
