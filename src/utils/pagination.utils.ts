import { PaginationFormatResponse } from 'src/types/pagination.type';

export const paginationFormat = <T>(
    data: T[] | null,
    metaData: PaginationFormatResponse,
) => {
    return {
        data,
        metaData,
    };
};
