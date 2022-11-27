import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { Kategori } from '../beranda/beranda.service';

@Injectable({
  providedIn: 'root'
})
export class KategoriService {

  constructor(
    private _http: HttpClient
  ) { }

  kategori(): Observable<any> {
    return this._http.get(environment.serverUrl + 'api/kategori')
  }

  updateKategori(kategori: Kategori): Observable<any> {
    return this._http.patch(environment.serverUrl + 'api/admin/kategori', kategori)
  }
}
