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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetPassword = exports.forgotPassword = exports.login = exports.signup = void 0;
var crypto_1 = __importDefault(require("crypto"));
var catchAsync_1 = __importDefault(require("../utils/catchAsync"));
var appError_1 = __importDefault(require("../utils/appError"));
var signToken_1 = __importDefault(require("../utils/signToken"));
var user_model_1 = __importDefault(require("../models/user.model"));
var passwordResetModel_1 = __importDefault(require("../models/passwordResetModel"));
var createSendToken = function (res, userId, statusCode) {
    var token = (0, signToken_1.default)({ userId: userId });
    var cookieOption = {
        maxAge: Number(process.env.COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
    };
    res.cookie("authToken", token, cookieOption);
    res.status(statusCode).json({ status: "Success" });
};
exports.signup = (0, catchAsync_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, firstname, surname, birthDate, address, email, phoneNumber, password, existingUser, newUser;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, firstname = _a.firstname, surname = _a.surname, birthDate = _a.birthDate, address = _a.address, email = _a.email, phoneNumber = _a.phoneNumber, password = _a.password;
                if (!firstname ||
                    !surname ||
                    !birthDate ||
                    !address ||
                    !email ||
                    !phoneNumber ||
                    !password)
                    return [2 /*return*/, next(new appError_1.default("Invalid empty fields", 400))];
                return [4 /*yield*/, user_model_1.default.findOne({ email: email })];
            case 1:
                existingUser = _b.sent();
                if (existingUser)
                    return [2 /*return*/, next(new appError_1.default("Email already exists", 400))];
                return [4 /*yield*/, user_model_1.default.create({
                        firstname: firstname,
                        surname: surname,
                        birthDate: birthDate,
                        address: address,
                        email: email,
                        phoneNumber: phoneNumber,
                        password: password,
                    })];
            case 2:
                newUser = _b.sent();
                createSendToken(res, newUser._id, 201);
                return [2 /*return*/];
        }
    });
}); });
exports.login = (0, catchAsync_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = req.body, email = _a.email, password = _a.password;
                if (!email || !password)
                    return [2 /*return*/, next(new appError_1.default("Invalid empty fields", 400))];
                return [4 /*yield*/, user_model_1.default.findOne({ email: email }).select("+password")];
            case 1:
                user = _c.sent();
                _b = !user;
                if (_b) return [3 /*break*/, 3];
                return [4 /*yield*/, (user === null || user === void 0 ? void 0 : user.comparePassword(password))];
            case 2:
                _b = !(_c.sent());
                _c.label = 3;
            case 3:
                if (_b)
                    return [2 /*return*/, next(new appError_1.default("Incorrect user credentials", 400))];
                createSendToken(res, user._id, 200);
                return [2 /*return*/];
        }
    });
}); });
exports.forgotPassword = (0, catchAsync_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var email, user, resetCode, codeHash, resetCodeExpires, passwordResetCode;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                email = req.body.email;
                if (!email)
                    return [2 /*return*/, next(new appError_1.default("Invalid empty email", 400))];
                return [4 /*yield*/, user_model_1.default.findOne({ email: email })];
            case 1:
                user = _a.sent();
                if (!user)
                    return [2 /*return*/, next(new appError_1.default("User belonging to this email not found", 404))];
                resetCode = Math.floor(100000 + Math.random() * 900000).toString();
                codeHash = crypto_1.default
                    .createHash("sha256")
                    .update(resetCode)
                    .digest("hex");
                resetCodeExpires = new Date(Date.now() + 5 * 60 * 1000);
                return [4 /*yield*/, passwordResetModel_1.default.create({
                        userId: user._id,
                        codeHash: codeHash,
                        expiresAt: resetCodeExpires,
                    })];
            case 2:
                passwordResetCode = _a.sent();
                res.status(200).json({ status: "Success" });
                return [2 /*return*/];
        }
    });
}); });
exports.resetPassword = (0, catchAsync_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, resetCode, newPassword, user, codeHash, storedCode;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _a = req.body, email = _a.email, resetCode = _a.resetCode, newPassword = _a.newPassword;
                if (!email || !resetCode || !newPassword) {
                    return [2 /*return*/, next(new appError_1.default("Missing required fields", 400))];
                }
                return [4 /*yield*/, user_model_1.default.findOne({ email: email })];
            case 1:
                user = _b.sent();
                if (!user)
                    return [2 /*return*/, next(new appError_1.default("User not found", 404))];
                codeHash = crypto_1.default
                    .createHash("sha256")
                    .update(resetCode)
                    .digest("hex");
                return [4 /*yield*/, passwordResetModel_1.default.findOne({
                        userId: user._id,
                        codeHash: codeHash,
                        expiresAt: { $gt: new Date() },
                    })];
            case 2:
                storedCode = _b.sent();
                if (!storedCode)
                    return [2 /*return*/, next(new appError_1.default("Invalid or expired code", 400))];
                user.password = newPassword;
                return [4 /*yield*/, user.save()];
            case 3:
                _b.sent();
                return [4 /*yield*/, passwordResetModel_1.default.deleteMany({ userId: user._id })];
            case 4:
                _b.sent(); // cleanup
                createSendToken(res, user._id, 200);
                return [2 /*return*/];
        }
    });
}); });
exports.logout = (0, catchAsync_1.default)(function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        res.clearCookie("authToken", {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            path: "/",
        });
        res.status(200).json({ status: "Success" });
        return [2 /*return*/];
    });
}); });
