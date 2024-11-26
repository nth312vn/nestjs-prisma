import { Module } from '@nestjs/common';
import { ImageModule } from 'src/images/image.module';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
    imports: [ImageModule],
    providers: [ProductService],
    controllers: [ProductController],
})
export class ProductModule {}
