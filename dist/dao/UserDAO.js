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
exports.UserDAO = void 0;
const db_1 = __importDefault(require("../db/db"));
class UserDAO {
    constructor(db) {
        this.db = db;
    }
    createUser(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            let id = "";
            try {
                [id] = yield this.db("users")
                    .insert({ username, password })
                    .returning("id");
            }
            catch (err) {
                throw new Error(`
            there is an error while inserting your credentials 
            to our database. Username already esists or 
            it is our server network issue
            `);
            }
            return id;
        });
    }
    findUser(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            let userData = {
                id: "",
                username: "",
                created_at: "",
            };
            try {
                [userData] = yield this.db("users")
                    .select("id", "username", "created_at")
                    .where({
                    username,
                    password,
                });
            }
            catch (err) {
                throw new Error("there is an error when finding the user credentials requested from the database");
            }
            if (!userData) {
                throw new Error("there is no user with the given credentials");
            }
            return userData;
        });
    }
}
exports.UserDAO = UserDAO;
exports.default = new UserDAO(db_1.default);
