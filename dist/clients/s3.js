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
exports.S3 = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const find_config_1 = __importDefault(require("find-config"));
const crypto_1 = __importDefault(require("crypto"));
const client_s3_1 = require("@aws-sdk/client-s3");
dotenv_1.default.config({ path: (0, find_config_1.default)(".env") || undefined });
function generateRandom(bytes = 32) {
    return crypto_1.default.randomBytes(bytes).toString("hex");
}
class S3 {
    constructor(accessKeyId = "", secretAccessKey = "", bucketName, endpoint = undefined) {
        this.bucketName = bucketName;
        // initialization is different in development and production. please adjust to fit both later!
        // region field should be included in production
        this.s3Client = new client_s3_1.S3Client({
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
            },
            endpoint: endpoint,
            forcePathStyle: true,
        });
    }
    storeImageReturningKey(buffer, mimeType) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = generateRandom();
            try {
                yield this.s3Client.send(new client_s3_1.PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                    Body: buffer,
                    ContentType: mimeType,
                }));
            }
            catch (e) {
                throw new Error(`failed to send the image data to external image storage.
                Message from trying to store the image: ${e.name} || ${e.message}
            `);
            }
            return key;
        });
    }
}
exports.S3 = S3;
exports.default = new S3(process.env.ACCESS_KEY, process.env.SECRET_ACCESS_KEY, process.env.BUCKET_NAME, process.env.ENDPOINT_URL);
