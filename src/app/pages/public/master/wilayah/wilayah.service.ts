import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { Wilayah } from './wilayah.types';

@Injectable({
  providedIn: 'root'
})
export class WilayahService {

  constructor(
    private http: HttpClient
  ) { }

  getWilayah(filter): Observable<any> {
    return this.http.get(environment.serverUrl + 'api/admin/master/wilayah', { 
      params: { filter: JSON.stringify(filter) } 
    })
  }

  createWilayah(newWilayah: Wilayah): Observable<{ wilayah: Wilayah }>{
    return this.http.post<{ wilayah: Wilayah }>(environment.serverUrl + 'api/admin/master/wilayah', newWilayah)
  }
  
  updateWilayah(newWilayah: Wilayah): Observable<{ wilayah: Wilayah }> {
    return this.http.patch<{ wilayah: Wilayah }>(environment.serverUrl + 'api/admin/master/wilayah', newWilayah)
  }

  deleteWilayah(_id) {
    return this.http.delete(environment.serverUrl + 'api/admin/master/wilayah', { params: { _id } })
  }
}
