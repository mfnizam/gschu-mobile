import { User } from "app/services/user/user.service";
import { Fungsi } from "../fungsi/fungsi.types";

export interface Jabatan {
  _id?: any;
  nama: string;
  fungsi: Fungsi;
  atasan: User;
}