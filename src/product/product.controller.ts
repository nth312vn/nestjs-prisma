import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { PaginationDto } from 'src/dto/pagination.dto';
import { CreateProductDto } from './dto/product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from 'src/decorator/user.decorator';
import { UserDecoratorData } from 'src/types/auth.type';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';

@Controller('product')
@UseGuards(JwtAuthGuard)
export class ProductController {
    constructor(private readonly productService: ProductService) {}
    @Get()
    getListProduct(@Query() pagination: PaginationDto) {
        return this.productService.getProducts(pagination);
    }
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productService.findOne(id);
    }
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    create(
        @Body() createProductDto: CreateProductDto,
        @User() user: UserDecoratorData,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.productService.createProduct(
            createProductDto,
            user.userId,
            file,
        );
    }
    @Put(':id')
    @UseInterceptors(FileInterceptor('file'))
    update(
        @Param('id') id: string,
        @Body() updateData: Partial<CreateProductDto>,
        @User() user: UserDecoratorData,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.productService.update(id, updateData, user.userId, file);
    }
}
