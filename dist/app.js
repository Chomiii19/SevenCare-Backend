"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var protect_1 = __importDefault(require("./middlewares/protect"));
var auth_routes_1 = __importDefault(require("./routes/auth.routes"));
var user_routes_1 = __importDefault(require("./routes/user.routes"));
var appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
var globalErrorHandler_1 = __importDefault(require("./controllers/globalErrorHandler"));
var appError_1 = __importDefault(require("./utils/appError"));
var app = (0, express_1.default)();
app.set("trust proxy", 1);
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use("/api/v1/auth", auth_routes_1.default);
app.use("/api/v1/users", protect_1.default, user_routes_1.default);
app.use("/api/v1/appointments", protect_1.default, appointment_routes_1.default);
// app.use("/api/v1/transactions");
app.use("/{*splat}", function (req, res, next) {
    return next(new appError_1.default("Can't find ".concat(req.originalUrl, " from the server."), 404));
});
app.use(globalErrorHandler_1.default);
exports.default = app;
