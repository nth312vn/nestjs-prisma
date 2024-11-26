import { Inject, Injectable } from '@nestjs/common';
import { v2, UploadApiResponse, UploadApiOptions } from 'cloudinary';

@Injectable()
export class ImageService {
    constructor(@Inject('CLOUDINARY') private readonly cloudinary: typeof v2) {}
    async uploadImage(
        file: Express.Multer.File,
        folder: string,
        options?: UploadApiOptions,
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            this.cloudinary.uploader.upload(
                file.path,
                { folder: folder, ...options },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            );
        });
    }
    async deleteImage(publicId: string) {
        return new Promise((resolve, reject) => {
            this.cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
    }
}
