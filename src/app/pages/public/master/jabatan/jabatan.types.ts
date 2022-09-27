import { Fungsi } from "../fungsi/fungsi.types";
import { Wilayah } from "../wilayah/wilayah.types";

export interface Jabatan {
  _id?: any;
  wilayah: Wilayah;
  fungsi: Fungsi;
  nama: string;
}