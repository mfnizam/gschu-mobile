import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CetakService {

  constructor(
    private http: HttpClient
  ) { }

  getPermintaan(filter): Observable<any> {
    return this.http.get(environment.serverUrl + 'api/admin/permintaan', { 
      params: { filter: JSON.stringify(filter) } 
    })
  }
}
