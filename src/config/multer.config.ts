import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { BadRequestException } from '@nestjs/common';

export const multerAvatarConfig: MulterOptions = {
    storage: new CloudinaryStorage({
        cloudinary: cloudinary,
    }),
    fileFilter: (req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(
                new BadRequestException(
                    'Invalid file type. Only JPG, JPEG, and PNG are allowed.',
                ),
                false,
            );
        }
        callback(null, true);
    },
    limits: {
        files: 1,
        fileSize: 1024 * 1024 * 5,
    },
};
