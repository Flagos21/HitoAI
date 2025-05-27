import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InscripcionService {
  private apiUrl = 'http://localhost:3000/api/inscripcion';

  constructor(private http: HttpClient) {}

  // Inscribir múltiples estudiantes a una asignatura
  inscribir(inscripciones: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear-masivo`, { inscripciones });
  }

  // Obtener estudiantes inscritos en una asignatura específica
  obtenerPorAsignatura(idAsignatura: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/por-asignatura/${idAsignatura}`);
  }

  // Desvincular (eliminar) una inscripción
  eliminar(idAsignatura: string, idEstudiante: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar?asignatura=${idAsignatura}&estudiante=${idEstudiante}`);
  }
}
