import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { environment } from 'environments/environment';
import { from, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { UserService } from 'app/services/user/user.service';
import { AuthUtils } from 'app/services/auth/auth.utils';
import { StorageService } from 'app/services/storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  _authenticated: boolean = false;
  
  constructor(
    private _http: HttpClient,
    private _user: UserService,
    private _storage: StorageService
  ) { }

  setAccessToken(token: string): Promise<any> { return this._storage.set('accessToken', token) }
  getAccessToken(): Promise<any> { return this._storage.get('accessToken') }

  masuk(credentials: { email: string; sandi: string }): Observable<any> {
    // if ( this._authenticated ) return throwError('User is already logged in.');
    return this._http.post(environment.serverUrl + 'api/auth/masuk', credentials).pipe(
      switchMap((response: any) => {
        if(response.success && response.accessToken){
          this.changeToken(response)
          return of(true);
        }
        return of(false);
      }));
  }

  daftar(user: { namaLengkap: string; email: string; sandi: string; }): Observable<any> {
    return this._http.post(environment.serverUrl + 'api/auth/daftar', user)
    .pipe(
      switchMap((response: any) => {
        if(response.success && response.accessToken){
          this.changeToken(response)
          // this.accessToken = response.accessToken;
          return of(true)
        }
        return of(false);
      })
      );
  }
  
  lupasandi(email): Observable<any> {
    return this._http.post(environment.serverUrl + 'api/auth/lupasandi', { email });
  }
  lupasandikadaluarsa(email): Observable<any> {
    return this._http.get(environment.serverUrl + 'api/auth/lupasandikadaluarsa', { params: { email } });
  }
  lupasandiverifikasikode(email, kode): Observable<any> {
    return this._http.post(environment.serverUrl + 'api/auth/lupasandiverifikasikode', {  email, kode });
  }
  lupasandikodeterverifikasi(email): Observable<any> {
    return this._http.get(environment.serverUrl + 'api/auth/lupasandikodeterverifikasi', { params: { email } });
  }
  sandibaru(email, sandi): Observable<any> {
    return this._http.post(environment.serverUrl + 'api/auth/sandibaru', {  email, sandi });
  }

  async keluar() {
    await this._storage.remove('accessToken');
    // await this._storage.remove('tokenNotif');
    
    this._authenticated = false;
    this._user.user = null;
  }

  signInUsingToken(): Observable<any> {
    return this._http.get(environment.serverUrl + 'api/auth/refresh-access-token')
    .pipe(
      catchError(() => of(false)),
      switchMap((response: any) => {
        if(response.success && response.accessToken){
          this.setAccessToken(response.accessToken)
          this._authenticated = true;
          this._user.user = AuthUtils._decodeToken(response.accessToken);
          return of(true);
        }
        return of(false)
      }));
  }

  changeToken(response){
    if(response.success && response.accessToken){
      this.setAccessToken(response.accessToken)
      this._authenticated = true;
      this._user.user = AuthUtils._decodeToken(response.accessToken);
    }
  }

  // TODO: test kondisi token ketika kadaluarsa atau data tidak valid
  authCheck(): Observable<boolean> {
    return from(this.getAccessToken())
    .pipe(switchMap(accessToken => {
      if(accessToken && !AuthUtils.isTokenExpired(accessToken)) {
        this._authenticated = true;
        this._user.user = AuthUtils._decodeToken(accessToken);
        return of(true);
      }
      // if (!accessToken) return of(false);
      // if (AuthUtils.isTokenExpired(accessToken)) return of(false);
      return this.signInUsingToken();
    }))
  }

  nonAuthCheck(){
    return from(this.getAccessToken())
    .pipe(switchMap(accessToken => {
      if(accessToken && !AuthUtils.isTokenExpired(accessToken)) {
        this._authenticated = true;
        this._user.user = AuthUtils._decodeToken(accessToken);
        return of(true);
      }
      return of(false);

      // if (!accessToken) return of(false);
      // if (AuthUtils.isTokenExpired(accessToken)) return of(false);
    }))
  }

  tokenNotifSimpan(tokenNotif): Observable<any>{
    return this._http.post<any>(environment.serverUrl + 'api/akun/tokennotif/simpan', { tokenNotif })
  }
  tokenNotifHapus(tokenNotif): Observable<any>{
    return this._http.post<any>(environment.serverUrl + 'api/akun/tokennotif/hapus', { tokenNotif })
  }
}
