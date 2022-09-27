import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { Jabatan } from './jabatan.types';

@Injectable({
  providedIn: 'root'
})
export class JabatanService {

  constructor(
    private http: HttpClient
  ) { }

  getJabatan(filter): Observable<any> {
    return this.http.get(environment.serverUrl + 'api/admin/master/jabatan', { 
      params: { filter: JSON.stringify(filter) } 
    })
  }

  createJabatan(newJabatan: Jabatan): Observable<{ jabatan: Jabatan }>{
    return this.http.post<{ jabatan: Jabatan }>(environment.serverUrl + 'api/admin/master/jabatan', newJabatan)
  }
  
  updateJabatan(newJabatan: Jabatan): Observable<{ jabatan: Jabatan }> {
    return this.http.patch<{ jabatan: Jabatan }>(environment.serverUrl + 'api/admin/master/jabatan', newJabatan)
  }

  deleteJabatan(_id): Observable<boolean> {
    return this.http.delete<boolean>(environment.serverUrl + 'api/admin/master/jabatan', { params: { _id } })
  }
}
