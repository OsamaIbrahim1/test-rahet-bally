import * as multer from "multer";
import { allowedExtensions } from "../utils";
import UniqueString from "../utils/generate-Unique-String";
import { Request } from "express";

export const multerImages = {

    storage: multer.diskStorage({
        filename: (req: Request, file: any, cb: any) => {
            const uniqueFilename = UniqueString.generateUniqueString(5) + "_" + file.originalname;
            cb(null, uniqueFilename);
        },
    }),
    fileFilter: (req: Request, file: any, cb: any) => {
        if (allowedExtensions.images.includes(file.mimetype.split("/")[1])) {
            return cb(null, true);
        }
        cb(new Error("file format is not allowed!"), false);
    },
    limits: {
        fileSize: 1024 * 1024 * 1
    }
}



