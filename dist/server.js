"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
var mongoose_1 = __importDefault(require("mongoose"));
var app_1 = __importDefault(require("./app"));
dotenv_1.default.config();
var PORT = process.env.PORT || 3000;
var DB = "".concat(process.env.DB).replace("<db_password>", process.env.DB_PASSWORD);
mongoose_1.default
    .connect(DB)
    .then(function () {
    console.log("Successfully connected to DB!");
    app_1.default.listen(PORT, function () { return console.log("Server is listening on port:", PORT); });
})
    .catch(function (err) { return console.error("Unable to connect to DB:", err); });
