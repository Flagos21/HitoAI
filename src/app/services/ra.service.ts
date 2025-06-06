import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ResultadoAprendizaje } from '../models/resultado-aprendizaje.model';

@Injectable({
  providedIn: 'root'
})
export class RaService {
  private apiUrl = `${environment.apiUrl}/api/ra`;

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<ResultadoAprendizaje[]> {
    return this.http.get<ResultadoAprendizaje[]>(this.apiUrl);
  }

  obtenerPorId(id: string): Observable<ResultadoAprendizaje> {
    return this.http.get<ResultadoAprendizaje>(`${this.apiUrl}/${id}`);
  }

  crear(ra: ResultadoAprendizaje): Observable<any> {
    // 🔥 asegurarse de no enviar ID_RA si existe
    const { ID_RA, ...nuevoRA } = ra;
    return this.http.post(`${this.apiUrl}/crear`, nuevoRA);
  }

  actualizar(id: string, ra: ResultadoAprendizaje): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, ra);
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }

  obtenerPorAsignatura(idAsignatura: string): Observable<ResultadoAprendizaje[]> {
    return this.http.get<ResultadoAprendizaje[]>(`${this.apiUrl}/por-asignatura/${idAsignatura}`);
  }

  obtenerPorAsignaturaDesdeContenido(idContenido: number): Observable<ResultadoAprendizaje[]> {
    return this.http.get<ResultadoAprendizaje[]>(`${this.apiUrl}/por-contenido/${idContenido}`);
  }


}
