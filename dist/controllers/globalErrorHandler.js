"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var sendErrorDev = function (err, res) {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err,
    });
};
var sendErrorProd = function (err, res) {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    else {
        console.error("ERROR: ", err);
        res.status(500).json({
            status: "Error",
            message: "Something went wrong!",
        });
    }
};
var globalErrorHandler = function (err, req, res, next) {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "Error";
    if (process.env.NODE_ENV === "DEVELOPMENT")
        sendErrorDev(err, res);
    if (process.env.NODE_ENV === "PRODUCTION") {
        var error = __assign({}, err);
        sendErrorProd(error, res);
    }
};
exports.default = globalErrorHandler;
