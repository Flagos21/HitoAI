import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ResultadoAprendizaje {
  ID_RA: string;
  Nombre: string;
  competencias: string[]; // ✅ nuevo campo con múltiples competencias
}

@Injectable({
  providedIn: 'root'
})
export class RaService {
  private apiUrl = 'http://localhost:3000/api/ra';

  constructor(private http: HttpClient) {}

  obtenerTodos(): Observable<ResultadoAprendizaje[]> {
    return this.http.get<ResultadoAprendizaje[]>(this.apiUrl);
  }

  obtenerPorId(id: string): Observable<ResultadoAprendizaje> {
    return this.http.get<ResultadoAprendizaje>(`${this.apiUrl}/${id}`);
  }

  crear(ra: ResultadoAprendizaje): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, ra);
  }

  actualizar(id: string, ra: ResultadoAprendizaje): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, ra);
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }
}
