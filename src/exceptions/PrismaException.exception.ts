import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = 404;
        if (exception.code === 'P2025') {
            response.status(status).json({
                statusCode: status,
                message: 'Record not found',
            });
        } else {
            response.status(500).json({
                statusCode: 500,
                message: 'Internal server error',
            });
        }
    }
}
