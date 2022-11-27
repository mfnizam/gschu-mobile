import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from 'app/services/user/user.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PersetujuanService {

  constructor(
    private _http: HttpClient,
    private _user: UserService
  ) { }

  persetujuan(jenis = 'menunggu', opsi = {}, ): Observable<any> {
    return this._http.get(environment.serverUrl + 'api/' + (this._user.user.penyetuju? 'penyetuju' : 'atasan') + '/' + jenis, { params: opsi })
  }

  detail(_id): Observable<{ permintaan: any }> {
    return this._http.get<{ permintaan: any }>(environment.serverUrl + 'api/' + (this._user.user.penyetuju? 'penyetuju' : 'atasan') + '/persetujuan/' + _id)
  }

  setuju(_id): Observable<boolean> {
    return this._http.patch<boolean>(environment.serverUrl + 'api/' + (this._user.user.penyetuju? 'penyetuju' : 'atasan') + '/persetujuan/setuju', { _id })
  }

  tolak(_id, catatan): Observable<boolean> {
    return this._http.patch<boolean>(environment.serverUrl + 'api/' + (this._user.user.penyetuju? 'penyetuju' : 'atasan') + '/persetujuan/tolak', { _id, catatan })
  }

  selesai(_id): Observable<boolean> {
    return this._http.patch<boolean>(environment.serverUrl + 'api/penyetuju/persetujuan/selesai', { _id })
  } 
}
