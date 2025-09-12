import { Types, Document } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstname: string;
  surname: string;
  birthDate: string;
  gender: string;
  maritalStatus: string;
  address: string;
  email: string;
  phoneNumber: string;
  password: string;
  comparePassword: (password: string) => Promise<Boolean>;
}