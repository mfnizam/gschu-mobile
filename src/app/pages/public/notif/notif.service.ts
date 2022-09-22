import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotifService {

  constructor(
    private _http: HttpClient
  ) { }

  notif(id): Observable<any> {
    return this._http.get(environment.serverUrl + 'api/public/notifikasi/' + id)
  }

  dibaca(_id): Observable<any> {
    return this._http.patch(environment.serverUrl + 'api/public/notifikasi/dibaca', { _id })
  }
}
