import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private apiUrl = `${environment.apiUrl}/api/reporte`;
  constructor(private http: HttpClient) {}

  generar(asignaturaId: number) {
    return this.http.get(`${this.apiUrl}/${asignaturaId}`, { responseType: 'blob' });
  }
}
