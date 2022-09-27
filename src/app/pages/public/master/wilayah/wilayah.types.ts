import { Zona } from "../zona/zona.types";

export interface Wilayah {
    _id?    : any;
    nama    : string;
    zona    : Zona;
    tipe    : string;
  }