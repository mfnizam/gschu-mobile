import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PenggunaService {

  constructor(
    private _http: HttpClient
  ) { }

  pengguna(): Observable<any>{
    return this._http.get(environment.serverUrl + 'api/admin/pengguna')
  }
}
