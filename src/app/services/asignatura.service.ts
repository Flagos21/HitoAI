import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AsignaturaService {
  private apiUrl = 'http://localhost:3000/api/asignatura';

  constructor(private http: HttpClient) {}

  obtenerTodas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  obtenerPorProfesor(rut: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/por-profesor/${rut}`);
  }

  obtenerPorCarreraDelJefe(rut: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/por-jefe/${rut}`);
  }

  crear(asignatura: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, asignatura);
  }

  actualizar(id: string, asignatura: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, asignatura);
  }

  eliminar(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }
}
