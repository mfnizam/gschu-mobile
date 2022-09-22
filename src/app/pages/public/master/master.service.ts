import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  jenis = [{
    kode: 'zona',
    nama: 'Zona'
  }, {
    kode: 'wilayah',
    nama: 'Wilayah Kerja'
  }, {
    kode: 'fungsi',
    nama: 'Fungsi'
  }, {
    kode: 'jabatan',
    nama: 'Jabatan'
  }, {
    kode: 'atasan',
    nama: 'Penyetuju (Atasan)'
  }, {
    kode: 'penyetuju',
    nama: 'Penyetuju (SCM)'
  }, {
    kode: 'kategori',
    nama: 'Kategori Permintaan'
  }]

  tipeFungsi = [{ _id: 'wilayah', nama: 'Wilayah Kerja' }, { _id: 'zona', nama: 'Zona' }]

  constructor(
    private _http: HttpClient
  ) { }

  data(jenis, filter): Observable<any> {
    return this._http.get(environment.serverUrl + 'api/admin/master/' + jenis, { params: { filter: JSON.stringify(filter) } })
  }

  tambah(jenis, data) {
    return this._http.post(environment.serverUrl + 'api/admin/master/' + jenis, data)
  }

  ubah(jenis, data) {
    return this._http.put(environment.serverUrl + 'api/admin/master/' + jenis, data)
  }

  hapus(jenis, _id) {
    return this._http.delete(environment.serverUrl + 'api/admin/master/' + jenis, { params: { _id } })
  }

  cekFungsiPenyetuju(wilayah): Observable<{ tersedia: boolean, penyetuju: any }> {
    return this._http.get<{ tersedia: boolean, penyetuju: any }>(environment.serverUrl + 'api/admin/cekfungsipenyetuju/', { params: { wilayah } })
  }
}
