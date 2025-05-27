import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionService {
  private apiUrl = 'http://localhost:3000/api/evaluacion';

  constructor(private http: HttpClient) {}

  contarPorAsignatura(asignaturaID: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/contar/${asignaturaID}`);
  }

  crearConAplicaciones(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear-con-aplicaciones`, data)
  }

  obtenerPorAsignatura(asignaturaID: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/por-asignatura/${asignaturaID}`);
  }
  obtenerContenidosUsados(asignaturaID: string): Observable<number[]> {
  return this.http.get<number[]>(`${this.apiUrl}/contenidos-usados/${asignaturaID}`);
}

}
