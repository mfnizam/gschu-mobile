// TODO: Create permintaan types

import { User } from "app/services/user/user.service";
import { Kategori } from "../beranda/beranda.service";

export interface Permintaan {
  user: User;
  noSurat: string;
  kategori: Kategori;
  // permintaan: RDP
  // TODO: Please contineu this interface
}