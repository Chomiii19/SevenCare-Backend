import { NextFunction, Request, Response } from "express";
import Appointment from "../models/appointment.model";
import catchAsync from "../utils/catchAsync";
import AppError from "../utils/appError";
import Doctor from "../models/doctor.model";

export const createAppointment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { medicalDepartment, date, time, email, phoneNumber } = req.body;

    if (!medicalDepartment || !date || !time || !email || !phoneNumber)
      return next(new AppError("Invalid empty fields", 400));

    const schedule = new Date(`${date}T${time}:00`);

    if (isNaN(schedule.getTime()))
      return next(new AppError("Invalid date or time format", 400));

    const newAppointment = await Appointment.create({
      patientId: req.user._id,
      medicalDepartment,
      schedule,
      email,
      phoneNumber,
    });

    res.status(201).json({
      status: "Success",
      data: normalizeAppointments([newAppointment])[0],
    });
  },
);

export const getAppointments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let appointments = await Appointment.find({
      patientId: req.user._id,
      isDeleted: false,
    }).sort({ schedule: 1 });

    res.status(200).json({
      status: "Success",
      data: normalizeAppointments(appointments),
    });
  },
);

export const deleteAppointment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const apptId = req.params.id;

    if (!apptId) return next(new AppError("Appointment not found", 404));

    const result = await Appointment.deleteOne({ _id: apptId });

    if (result.deletedCount === 0)
      return next(new AppError("Appointment not found", 404));

    res
      .status(200)
      .json({ status: "Success", msg: "Appointment successfully deleted" });
  },
);

export const getAllPendingAppointments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const { status, date, service } = req.query;

    const filter: any = { isDeleted: false, status: "Pending" };

    if (date) {
      const selectedDate = new Date(date as string);
      const utc8Offset = 8 * 60 * 60 * 1000;
      const localNow = new Date(selectedDate.getTime() + utc8Offset);

      const start = new Date(
        Date.UTC(
          localNow.getUTCFullYear(),
          localNow.getUTCMonth(),
          localNow.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );
      const end = new Date(
        Date.UTC(
          localNow.getUTCFullYear(),
          localNow.getUTCMonth(),
          localNow.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      );

      filter.schedule = { $gte: start, $lt: end };
    }

    if (service) {
      const serviceArray = Array.isArray(service) ? service : [service];
      filter.medicalDepartment = { $in: serviceArray };
    }

    const total = await Appointment.countDocuments(filter);

    const appointments = await Appointment.find(filter)
      .sort({ schedule: -1 })
      .skip(skip)
      .limit(limit)
      .populate("patientId", "firstname surname");

    res.status(200).json({
      status: "Success",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      results: appointments.length,
      data: normalizeAppointments(appointments),
    });
  },
);

export const getTodayApprovedAppointments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const now = new Date();
    const utc8Offset = 8 * 60 * 60 * 1000;
    const localNow = new Date(now.getTime() + utc8Offset);

    const startOfDayLocal = new Date(
      Date.UTC(
        localNow.getUTCFullYear(),
        localNow.getUTCMonth(),
        localNow.getUTCDate(),
        0,
        0,
        0,
        0,
      ),
    );
    const endOfDayLocal = new Date(
      Date.UTC(
        localNow.getUTCFullYear(),
        localNow.getUTCMonth(),
        localNow.getUTCDate(),
        23,
        59,
        59,
        999,
      ),
    );

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const skip = (page - 1) * limit;

    const { status, service, patientName, doctorName } = req.query;

    const filter: any = {
      isArchived: false,
      status: "Approved",
      schedule: { $gte: startOfDayLocal, $lte: endOfDayLocal },
    };

    if (status) filter.status = status;

    if (service) {
      const serviceArray = Array.isArray(service) ? service : [service];
      filter.medicalDepartment = { $in: serviceArray };
    }

    // Fetch appointments with patient and doctor populated
    let appointments = await Appointment.find(filter)
      .sort({ schedule: -1 })
      .skip(skip)
      .limit(limit)
      .populate("patientId", "firstname surname")
      .populate("doctorId", "name");

    let total = await Appointment.countDocuments(filter);

    // Apply patientName filter
    if (patientName) {
      const regex = new RegExp(patientName as string, "i");
      appointments = appointments.filter((appt) => {
        const patient = appt.patientId as any;
        const fullName = `${patient.firstname} ${patient.surname}`;
        return regex.test(fullName);
      });
      total = appointments.length;
    }

    // Apply doctorName filter
    if (doctorName) {
      const regex = new RegExp(doctorName as string, "i");
      appointments = appointments.filter((appt) => {
        const doctor = appt.doctorId as any;
        return doctor && regex.test(doctor.name);
      });
      total = appointments.length;
    }

    res.status(200).json({
      status: "Success",
      results: appointments.length,
      total,
      currentPage: page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: normalizeAppointments(appointments),
    });
  },
);

export const getAllAppointments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { status, date, service, patientName, doctorName } = req.query;

    await Appointment.updateMany(
      { isArchived: { $exists: false } }, // only documents without the field
      { $set: { isArchived: false } },
    );

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const skip = (page - 1) * limit;

    const filter: any = { isArchived: false };

    if (status) filter.status = status;

    if (date) {
      const selectedDate = new Date(date as string);
      const utc8Offset = 8 * 60 * 60 * 1000;
      const localDate = new Date(selectedDate.getTime() - utc8Offset);

      const start = new Date(
        Date.UTC(
          localDate.getUTCFullYear(),
          localDate.getUTCMonth(),
          localDate.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );
      const end = new Date(
        Date.UTC(
          localDate.getUTCFullYear(),
          localDate.getUTCMonth(),
          localDate.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      );

      filter.schedule = { $gte: start, $lt: end };
    }

    if (service) {
      const serviceArray = Array.isArray(service) ? service : [service];
      filter.medicalDepartment = { $in: serviceArray };
    }

    // Fetch appointments with patient populated
    let appointments = await Appointment.find(filter)
      .sort({ schedule: -1 })
      .skip(skip)
      .limit(limit)
      .populate("patientId", "firstname surname")
      .populate("doctorId", "name");

    let total = await Appointment.countDocuments(filter);

    // Apply patientName filter if present
    if (patientName) {
      const regex = new RegExp(patientName as string, "i");
      appointments = appointments.filter((appt) => {
        const patient = appt.patientId as unknown as {
          firstname: string;
          surname: string;
        };
        const fullName = `${patient.firstname} ${patient.surname}`;
        return regex.test(fullName);
      });
      total = appointments.length; // update total for filtered results
    }

    if (doctorName) {
      const regex = new RegExp(doctorName as string, "i");
      appointments = appointments.filter((appt) => {
        const d = appt.doctorId as any;
        return d && regex.test(d.name);
      });
      total = appointments.length;
    }

    res.status(200).json({
      status: "Success",
      results: appointments.length,
      total,
      currentPage: page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: normalizeAppointments(appointments),
    });
  },
);

export const updateAppointmentStatus = async (req: Request, res: Response) => {
  try {
    const { id, action } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    if (action === "approve") {
      appointment.status = "Approved";
    } else if (action === "decline") {
      appointment.status = "Declined";
    } else if (action === "completed") {
      appointment.status = "Completed";
    } else if (action === "noshow") {
      appointment.status = "No Show";
    } else {
      return res.status(400).json({ message: "Invalid action" });
    }

    await appointment.save();
    res.status(200).json({
      message: "Appointment updated",
      appointment: normalizeAppointments([appointment])[0],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const getCancelledAppointments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const appointments = await Appointment.find({
      isDeleted: false,
      status: { $in: ["Cancelled", "No Show"] },
    }).sort({ schedule: 1 });

    res.status(200).json({
      status: "Success",
      results: appointments.length,
      data: normalizeAppointments(appointments),
    });
  },
);

function normalizeAppointments(appts: any[]) {
  return appts.map((appt) => {
    const obj = appt.toObject ? appt.toObject() : appt;
    const date = new Date(obj.schedule);

    date.setHours(date.getHours() - 8);
    obj.schedule = date.toISOString();

    if (obj.patientId) {
      obj.patientName = `${obj.patientId.firstname} ${obj.patientId.surname}`;
      delete obj.patientId;
    }

    return obj;
  });
}

export const updateAppointmentDoctor = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { doctorId } = req.body;

    if (!doctorId) return next(new AppError("doctorId is required", 400));

    const doctorExists = await Doctor.findById(doctorId);
    if (!doctorExists) {
      return next(new AppError("Doctor not found", 404));
    }

    const updated = await Appointment.findByIdAndUpdate(
      id,
      { doctorId },
      { new: true },
    )
      .populate("patientId", "firstname surname email")
      .populate("doctorId", "name specialization schedule");

    if (!updated) {
      return next(new AppError("Appointment not found", 404));
    }

    res.status(200).json({
      status: "Success",
      message: "Doctor updated for appointment",
      data: updated,
    });
  },
);

export const toggleArchiveAppointment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { archive } = req.body;

    if (archive === undefined)
      return next(new AppError("Archive value must be provided", 400));

    const appointment = await Appointment.findById(id)
      .populate("patientId", "firstname surname email")
      .populate("doctorId", "name specialization schedule");

    if (!appointment) return next(new AppError("Appointment not found", 404));

    appointment.isArchived = !!archive;
    await appointment.save();

    res.status(200).json({
      status: "Success",
      message: archive
        ? "Appointment archived successfully"
        : "Appointment unarchived successfully",
      data: normalizeAppointments([appointment])[0],
    });
  },
);

export const getArchivedAppointments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 15;
    const skip = (page - 1) * limit;
    const { status, date, service, patientName, doctorName } = req.query;

    const filter: any = { isArchived: true };

    if (status) filter.status = status;

    if (date) {
      const selectedDate = new Date(date as string);
      const utc8Offset = 8 * 60 * 60 * 1000;
      const localDate = new Date(selectedDate.getTime() - utc8Offset);

      const start = new Date(
        Date.UTC(
          localDate.getUTCFullYear(),
          localDate.getUTCMonth(),
          localDate.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );
      const end = new Date(
        Date.UTC(
          localDate.getUTCFullYear(),
          localDate.getUTCMonth(),
          localDate.getUTCDate(),
          23,
          59,
          59,
          999,
        ),
      );

      filter.schedule = { $gte: start, $lt: end };
    }

    if (service) {
      const serviceArray = Array.isArray(service) ? service : [service];
      filter.medicalDepartment = { $in: serviceArray };
    }

    // Fetch appointments with patient and doctor populated
    let appointments = await Appointment.find(filter)
      .sort({ schedule: -1 })
      .skip(skip)
      .limit(limit)
      .populate("patientId", "firstname surname")
      .populate("doctorId", "name");

    let total = await Appointment.countDocuments(filter);

    // Apply patientName filter
    if (patientName) {
      const regex = new RegExp(patientName as string, "i");
      appointments = appointments.filter((appt) => {
        const patient = appt.patientId as any;
        const fullName = `${patient.firstname} ${patient.surname}`;
        return regex.test(fullName);
      });
      total = appointments.length;
    }

    // Apply doctorName filter
    if (doctorName) {
      const regex = new RegExp(doctorName as string, "i");
      appointments = appointments.filter((appt) => {
        const doctor = appt.doctorId as any;
        return doctor && regex.test(doctor.name);
      });
      total = appointments.length;
    }

    res.status(200).json({
      status: "Success",
      results: appointments.length,
      total,
      currentPage: page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: normalizeAppointments(appointments),
    });
  },
);
