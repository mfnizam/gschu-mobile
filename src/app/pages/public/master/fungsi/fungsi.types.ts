import { User } from "app/services/user/user.service";
import { Wilayah } from "../wilayah/wilayah.types";
import { Zona } from "../zona/zona.types";

export interface Fungsi {
  _id?: any;
  organisasi: Organisasi;
  tipe: string;
  nama: string;
  ttdAtasan?: boolean;
  atasan?: User;
  penyetuju?: User;
  jabatanHasAtasan?: boolean;
}

export interface Organisasi {
  _id?: any;
  nama: string;
  zona?: Zona;
  tipe: string;
}