import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthUtils } from 'app/services/auth/auth.utils';
import { UserService } from 'app/services/user/user.service';
import { AuthService } from 'app/services/auth/auth.service';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class AkunService {

  constructor(
    private _http: HttpClient,
    private _user: UserService,
    private _auth: AuthService
  ) { }

  akun(){
    return this._http.get(environment.serverUrl + 'api/akun/akun')
    .pipe(tap(res => { this._auth.changeToken(res) }))
  }

  simpan(data): Observable<any> {
    return this._http.post(environment.serverUrl + 'api/akun/ubah', data)
    .pipe(tap(res => { this._auth.changeToken(res) }))
  }

  uploadFoto(photo: Blob): Observable<any> {
    let formData: FormData = new FormData();
    formData.append('file', photo, 'profil');

    return this._http.post<any>(environment.serverUrl + 'api/akun/ubah/foto', formData)
    .pipe(tap(res => { this._auth.changeToken(res) }))
  }
}
