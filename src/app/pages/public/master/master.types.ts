export interface Zona {
  _id?    : any;
  nama    : string;
}

export interface Wilayah {
  _id?    : any;
  nama    : string;
  zona    : Zona;
}

export interface Fungsi {
  _id?        : any;
  organisasi  : Wilayah & Zona;
  tipe        : string;
  nama        : string;
  terhubung   : this
}

export interface Jabatan {
  _id?    : any;
  wilayah : Wilayah;
  fungsi  : Fungsi;
  nama    : string;
}