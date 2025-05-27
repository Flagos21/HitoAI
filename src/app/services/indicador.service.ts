import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IndicadorService {
  private apiUrl = 'http://localhost:3000/api/indicador';

  constructor(private http: HttpClient) {}

  obtenerPorContenido(idContenido: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/por-contenido/${idContenido}`);
  }

  obtenerCriteriosPorIndicador(indicadorID: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/criterios/${indicadorID}`);
  }

  crear(indicador: any, criterios: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, { indicador, criterios });
  }

  actualizar(id: number, indicador: any, criterios: any[]): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, { indicador, criterios });
  }

  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }
}
