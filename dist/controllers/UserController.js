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
exports.UserController = void 0;
const UserService_1 = __importDefault(require("../services/UserService"));
class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    createUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof req.body.username !== "string" ||
                typeof req.body.password !== "string") {
                return next(new Error("either username or password is not provided or of an invalid format"));
            }
            let id = "";
            try {
                id = yield this.userService.createUser(req.body.username, req.body.password);
            }
            catch (err) {
                return next(err);
            }
            return res.json({ id });
        });
    }
    findUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof req.body.username !== "string" ||
                typeof req.body.password !== "string") {
                return next(new Error("either username or password is not provided or of an invalid format"));
            }
            let userData = {
                id: "",
                username: "",
                created_at: "",
            };
            try {
                userData = yield this.userService.findUser(req.body.username, req.body.password);
            }
            catch (err) {
                return next(err);
            }
            return res.json(userData);
        });
    }
}
exports.UserController = UserController;
exports.default = new UserController(UserService_1.default);
