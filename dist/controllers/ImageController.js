"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageController = void 0;
const ImageService_1 = __importDefault(require("../services/ImageService"));
const helper = {
    isImage: (mimetype) => {
        const acceptableType = /^image/;
        return mimetype.match(acceptableType);
    },
};
class ImageController {
    constructor(imageService) {
        this.imageService = imageService;
    }
    createImage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.file) {
                return next(new Error(`
                no image file has been attached
                `));
            }
            if (!helper.isImage(req.file.mimetype)) {
                return next(new Error(`
                the file attached is not an image
                `));
            }
            if (typeof req.body.user !== "string") {
                return next(new Error(`
                there is no user id given
                `));
            }
            let id = "";
            try {
                id = yield this.imageService.createImage(req.file.buffer, req.file.mimetype, req.body.user);
            }
            catch (err) {
                return next(err);
            }
            return res.json({ id });
        });
    }
}
exports.ImageController = ImageController;
exports.default = new ImageController(ImageService_1.default);
