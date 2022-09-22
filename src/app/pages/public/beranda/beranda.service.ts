import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from 'app/services/user/user.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

export interface Kategori {
  _id: any;
  kode: string;
  nama: string;
}

@Injectable({
  providedIn: 'root'
})
export class BerandaService {

  public _kategori: Kategori[] = [{
    "_id": "62bc78629a5a8f3e802d81f2",
    "kode": "rdp",
    "nama": "Perbaikan RDP & Fasum"
  }, {
    "_id": "62bc8665059db0d11fde1bde",
    "kode": "furniture",
    "nama": "Permintaan \nFurniture"
  }, {
    "_id": "62bc89b5059db0d11fde1c3a",
    "kode": "rumput",
    "nama": "Potong Rumput / Tebang Pohon"
  }, {
    "_id": "62bc89c5059db0d11fde1c46",
    "kode": "ac",
    "nama": "Perawatan & Perbaikan AC"
  }, {
    "_id": "62bc89d3059db0d11fde1c52",
    "kode": "atk",
    "nama": "Alat Tulis \nKantor"
  }, {
    "_id": "62bc89e1059db0d11fde1c5e",
    "kode": "snack",
    "nama": "Snack & Makanan Berat"
  }, {
    "_id": "62bc89ee059db0d11fde1c6a",
    "kode": "krp",
    "nama": "Kend. Ringan Penumpang"
  }, {
    "_id": "62bc89fb059db0d11fde1c76",
    "kode": "mess",
    "nama": "Mess / \nPenginapan"
  }, {
    "_id": "62bc8a06059db0d11fde1c82",
    "kode": "dokumen",
    "nama": "Pengiriman \nDokumen"
  }, {
    "_id": "62bc8a13059db0d11fde1c8e",
    "kode": "galon",
    "nama": "Air Mineral \n(Galon)"
  }, {
    "_id": "62bc8a1e059db0d11fde1c9a",
    "kode": "acara",
    "nama": "Penyiapan \nAcara"
  }, {
    "_id": "62bc8a2b059db0d11fde1ca6",
    "kode": "peralatan",
    "nama": "Peralatan (Lampu & Kebersihan)"
  }]

  constructor(
    private _http: HttpClient,
    private _user: UserService
  ) { }

  kategori(): Observable<any>{
    return this._http.get(environment.serverUrl + 'api/kategori')
  }

  beranda(opsi): Observable<{ permintaan: any, persetujuan?: any, totalNotifikasi: any }>{
    let level = this._user.user.penyetuju? 'penyetuju' : this._user.user.atasan? 'atasan' : 'public';
    return this._http.get<{ permintaan: any, persetujuan?: any, totalNotifikasi: any }>(environment.serverUrl + 'api/' + level + '/beranda', { params: opsi })
  }
}
