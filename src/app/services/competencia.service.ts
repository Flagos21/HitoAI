import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Competencia {
  ID_Competencia: string;
  Nombre: string;
  Tipo: string; // Esto ahora es la descripción
}

@Injectable({
  providedIn: 'root'
})
export class CompetenciaService {
  private apiUrl = `${environment.apiUrl}/api/competencia`; // Asegúrate que este sea tu prefijo correcto

  constructor(private http: HttpClient) {}

  obtenerTodas(): Observable<Competencia[]> {
    return this.http.get<Competencia[]>(this.apiUrl);
  }

  obtenerPorId(id: string): Observable<Competencia> {
    return this.http.get<Competencia>(`${this.apiUrl}/${id}`);
  }

  crear(competencia: Competencia): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, competencia);
  }

  actualizar(id: string, competencia: Competencia): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, competencia);
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }
}
