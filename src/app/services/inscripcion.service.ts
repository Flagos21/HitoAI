import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Inscripcion } from '../models/inscripcion.model';

@Injectable({
  providedIn: 'root'
})
export class InscripcionService {
  private apiUrl = `${environment.apiUrl}/api/inscripcion`;

  constructor(private http: HttpClient) {}

  // Inscribir múltiples estudiantes a una asignatura
  inscribir(inscripciones: Inscripcion[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear-masivo`, { inscripciones });
  }

  // Obtener estudiantes inscritos en una asignatura específica
  obtenerPorAsignatura(idAsignatura: string): Observable<Inscripcion[]> {
    return this.http.get<Inscripcion[]>(`${this.apiUrl}/por-asignatura/${idAsignatura}`);
  }

  // Desvincular (eliminar) una inscripción
  eliminar(idAsignatura: string, idEstudiante: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar?asignatura=${idAsignatura}&estudiante=${idEstudiante}`);
  }
}
