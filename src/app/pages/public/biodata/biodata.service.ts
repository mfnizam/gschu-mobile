import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'app/services/auth/auth.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BiodataService {

  constructor(
    private _http: HttpClient,
    private _auth: AuthService
  ) { }

  simpan(data): Observable<any> {
    return this._http.post(environment.serverUrl + 'api/akun/ubah', data)
    .pipe(tap((res) => { this._auth.changeToken(res) }))
  }
  
  pilihan(jenis, filter): Observable<any> {
    return this._http.get(environment.serverUrl + 'api/public/' + jenis, { params: { filter: JSON.stringify(filter) } })
  }
}
