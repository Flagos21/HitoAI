import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private apiUrl = `${environment.apiUrl}/api/informe`;
  constructor(private http: HttpClient) {}

  generar(asignaturaId: number) {
    return this.http.get(`${this.apiUrl}/${asignaturaId}`, { responseType: 'blob' });
  }

  pdf(asignaturaId: number) {
    return this.http.get(`${this.apiUrl}/${asignaturaId}/pdf`, { responseType: 'blob' });
  }

  word(asignaturaId: number) {
    return this.http.get(`${this.apiUrl}/${asignaturaId}/word`, { responseType: 'blob' });
  }
}
