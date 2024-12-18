import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            exceptionFactory(errors) {
                return new UnprocessableEntityException({
                    message: 'Validation failed',
                    error: {
                        field: errors[0].property,
                        message: errors[0].constraints,
                    },
                });
            },
        }),
    );
    app.enableCors();

    const config = new DocumentBuilder()
        .setTitle('API docs')
        .setDescription('API description')
        .setVersion('1.0')
        .addTag('v1')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT-auth',
        )
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    await app.listen(8080);
}
bootstrap();
