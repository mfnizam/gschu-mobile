import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotifikasiService {

  constructor(
    private _http: HttpClient
  ) { }

  notifikasi(): Observable<any> {
    return this._http.get(environment.serverUrl + 'api/public/notifikasi')
  }

  total(): Observable<any> {
    return this._http.get(environment.serverUrl + 'api/public/notifikasi/total')
  }  
}
