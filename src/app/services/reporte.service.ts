import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private apiUrl = `${environment.apiUrl}/api/informe`;
  constructor(private http: HttpClient) {}

  word(asignaturaId: number) {
    return this.http.get(`${this.apiUrl}/${asignaturaId}/word`, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}
