import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RaService {
  private apiUrl = 'http://localhost:3000/api/ra';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  obtenerPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  crear(ra: any): Observable<any> {
    // 🔥 asegurarse de no enviar ID_RA si existe
    const { ID_RA, ...nuevoRA } = ra;
    return this.http.post(`${this.apiUrl}/crear`, nuevoRA);
  }

  actualizar(id: string, ra: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, ra);
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }

  obtenerPorAsignatura(idAsignatura: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/por-asignatura/${idAsignatura}`);
}
obtenerPorAsignaturaDesdeContenido(idContenido: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/por-contenido/${idContenido}`);
}


}
