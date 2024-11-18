import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDecoratorData } from 'src/types/auth';

export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user as UserDecoratorData;
    },
);
