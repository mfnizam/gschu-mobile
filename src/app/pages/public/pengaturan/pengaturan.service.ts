import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PengaturanService {

  constructor(
    private _http: HttpClient
  ) { }

  semuatotal(): Observable<any> {
    return this._http.get(environment.serverUrl + 'api/admin/master/semuatotal')
  }
}
