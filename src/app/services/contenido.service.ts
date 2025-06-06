import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Contenido } from '../models/contenido.model';

@Injectable({
  providedIn: 'root'
})
export class ContenidoService {
  private apiUrl = `${environment.apiUrl}/api/contenido`;

  constructor(private http: HttpClient) {}

  // Obtener todos los contenidos por asignatura
  obtenerPorAsignatura(idAsignatura: string): Observable<Contenido[]> {
    return this.http.get<Contenido[]>(`${this.apiUrl}/por-asignatura/${idAsignatura}`);
  }

  // Crear un nuevo contenido
  crear(data: Contenido): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, data);
  }

  // Actualizar contenido
  actualizar(id: number, data: Contenido): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, data);
  }

  // Eliminar contenido (opcional)
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }
}
