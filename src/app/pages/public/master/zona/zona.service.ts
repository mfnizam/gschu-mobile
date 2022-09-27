import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { Zona } from './zona.types';

@Injectable({
  providedIn: 'root'
})
export class ZonaService {

  constructor(
    private http: HttpClient
  ) { }

  getZona(filter): Observable<any> {
    return this.http.get(environment.serverUrl + 'api/admin/master/zona', { 
      params: { filter: JSON.stringify(filter) } 
    })
  }

  createZona(newZona: Zona): Observable<{ zona: Zona }>{
    return this.http.post<{ zona: Zona }>(environment.serverUrl + 'api/admin/master/zona', newZona)
  }
  
  updateZona(newZona: Zona): Observable<{ zona: Zona }> {
    return this.http.patch<{ zona: Zona }>(environment.serverUrl + 'api/admin/master/zona', newZona)
  }

  deleteZona(_id) {
    return this.http.delete(environment.serverUrl + 'api/admin/master/zona', { params: { _id } })
  }
}
