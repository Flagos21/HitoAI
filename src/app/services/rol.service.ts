import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolService {
  private apiUrl = `${environment.apiUrl}/api/rol`;

  constructor(private http: HttpClient) {}

  getRoles() {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }
}
