import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstudianteService {
  private apiUrl = `${environment.apiUrl}/api/estudiante`;

  constructor(private http: HttpClient) {}

  // Obtener todos los estudiantes
  obtenerTodos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  // Obtener estudiantes no inscritos
  obtenerNoInscritos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/no-inscritos`);
  }

  // Crear estudiante
  crear(estudiante: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, estudiante);
  }

  // Actualizar estudiante
  actualizar(id: string, estudiante: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, estudiante);
  }

  // Eliminar estudiante
  eliminar(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }

  // Cargar desde archivo CSV
  cargarDesdeCSV(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.http.post(`${this.apiUrl}/cargar-csv`, formData);
  }
}
