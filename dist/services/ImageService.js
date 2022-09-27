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
exports.ImageService = void 0;
const ImageDAO_1 = __importDefault(require("../dao/ImageDAO"));
const s3_1 = __importDefault(require("../clients/s3"));
class ImageService {
    constructor(imageDAO, s3) {
        this.imageDAO = imageDAO;
        this.s3 = s3;
    }
    createImage(buffer, mimeType, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = yield this.s3.storeImageReturningKey(buffer, mimeType);
            const id = yield this.imageDAO.createImage(key, user);
            return id;
        });
    }
}
exports.ImageService = ImageService;
exports.default = new ImageService(ImageDAO_1.default, s3_1.default);
