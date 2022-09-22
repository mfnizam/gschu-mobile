import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PermintaanService {

  constructor(
    private _http: HttpClient
  ) { }

  permintaan(opsi): Observable<any> {
    return this._http.get(environment.serverUrl + 'api/public/permintaan', { params: opsi })
  }

  detail(_id): Observable<any> {
    return this._http.get(environment.serverUrl + 'api/public/permintaan/' + _id)
  }

  tambah(data: FormData): Observable<any> {
    return this._http.post(environment.serverUrl + 'api/public/permintaan', data)
  }

  ubah(data: FormData): Observable<any> {
    return this._http.patch(environment.serverUrl + 'api/public/permintaan', data)
  }

  setStatus(permintaan) {
    if (permintaan.selesai) {
      return 'selesai'
    } else if (permintaan.disetujui?.status == 1) {
      return 'proses'
    } else if (permintaan.disetujui?.status == 2) {
      return 'ditolakPenyetuju'
    } else if (permintaan.diketahui?.disabled || permintaan.diketahui?.status == 1) {
      return 'menungguPenyetuju'
    } else if (permintaan.diketahui?.status == 2) {
      return 'ditolakAtasan'
    } else {
      return 'menungguAtasan'
    }
  }

  ulasan(_id, peringkat, ulasan){
    return this._http.post(environment.serverUrl + 'api/public/ulasan', { _id, peringkat, ulasan })
  }
}
