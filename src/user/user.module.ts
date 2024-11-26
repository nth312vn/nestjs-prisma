import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ImageModule } from 'src/images/image.module';

@Module({
    imports: [ImageModule],
    providers: [UserService],
    controllers: [UserController],
})
export class UserModule {}
