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
exports.ImageDAO = void 0;
const db_1 = __importDefault(require("../db/db"));
class ImageDAO {
    constructor(db) {
        this.db = db;
    }
    createImage(key, user) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = "";
            try {
                [id] = yield this.db("images")
                    .insert({ key, user })
                    .returning("id");
            }
            catch (e) {
                throw new Error(`
            there is an error while inserting your image 
            to our database. Either the user credentials attached to your 
            image doesn't exist or it is our server network issue
            `);
            }
            return id;
        });
    }
}
exports.ImageDAO = ImageDAO;
exports.default = new ImageDAO(db_1.default);
