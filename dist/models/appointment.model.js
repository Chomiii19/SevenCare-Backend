"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importStar(require("mongoose"));
var validator_1 = __importDefault(require("validator"));
var AppointmentSchema = new mongoose_1.default.Schema({
    patientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    medicalDepartment: {
        type: String,
        required: true,
        enum: [
            "Consultation",
            "Vaccination",
            "Medical Certificate",
            "Laboratory",
            "Holistic Care",
            "Circumcision/TULI",
            "Medical Check Up",
            "Prenatal Check Up",
            "Family Planning",
        ],
    },
    schedule: {
        type: Date,
        required: true,
    },
    email: {
        type: String,
        required: [true, "Email field is required"],
        validate: [validator_1.default.isEmail, ""],
    },
    phoneNumber: {
        type: String,
        required: [true, "PhoneNumber field is required"],
    },
    status: {
        type: String,
        default: "Pending",
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
});
var Appointment = mongoose_1.default.model("Appointment", AppointmentSchema);
exports.default = Appointment;
