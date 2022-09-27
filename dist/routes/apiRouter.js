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
const express_1 = require("express");
const UserController_1 = __importDefault(require("../controllers/UserController"));
const ImageController_1 = __importDefault(require("../controllers/ImageController"));
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
const router = (0, express_1.Router)();
router.get("/users", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield UserController_1.default.findUser(req, res, next);
    });
});
router.post("/users", function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield UserController_1.default.createUser(req, res, next);
    });
});
router.post("/images", upload.single("image"), function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield ImageController_1.default.createImage(req, res, next);
    });
});
exports.default = router;
