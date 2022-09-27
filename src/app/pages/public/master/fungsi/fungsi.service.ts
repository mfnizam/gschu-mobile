import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { Fungsi } from './fungsi.types';

@Injectable({
  providedIn: 'root'
})
export class FungsiService {

  constructor(
    private http: HttpClient
  ) { }

  getFungsi(filter): Observable<any> {
    return this.http.get(environment.serverUrl + 'api/admin/master/fungsi', { 
      params: { filter: JSON.stringify(filter) } 
    })
  }

  getOrganisasi(filter): Observable<any> {
    return this.http.get(environment.serverUrl + 'api/admin/master/organisasi', { 
      params: { filter: JSON.stringify(filter) } 
    })
  }

  getUser(filter): Observable<any> {
    return this.http.get(environment.serverUrl + 'api/admin/master/user', { 
      params: { filter: JSON.stringify(filter) } 
    })
  }

  createFungsi(newFungsi: Fungsi): Observable<{ fungsi: Fungsi }>{
    return this.http.post<{ fungsi: Fungsi }>(environment.serverUrl + 'api/admin/master/fungsi', newFungsi)
  }
  
  updateFungsi(newFungsi: Fungsi): Observable<{ fungsi: Fungsi }> {
    return this.http.patch<{ fungsi: Fungsi }>(environment.serverUrl + 'api/admin/master/fungsi', newFungsi)
  }

  deleteFungsi(_id) {
    return this.http.delete(environment.serverUrl + 'api/admin/master/fungsi', { params: { _id } })
  }
}
