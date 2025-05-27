import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AplicacionService {
  private apiUrl = 'http://localhost:3000/api/aplicacion';

  constructor(private http: HttpClient) {}

  obtenerIndicadoresPorEvaluacion(evaluacionID: number, asignaturaID: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/indicadores/${evaluacionID}/${asignaturaID}`);
  }

  actualizarPuntajesGrupo(data: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/actualizar-puntajes`, data);
  }

  obtenerAplicados(evaluacionID: number, asignaturaID: string): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/aplicados/${evaluacionID}/${asignaturaID}`);
  }

  obtenerAplicacionesEvaluadas(evaluacionID: number, asignaturaID: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/evaluadas/${evaluacionID}/${asignaturaID}`);
  }

  obtenerPuntajesEstudiante(
    evaluacionID: number,
    asignaturaID: string,
    estudianteID: string
  ): Observable<{ indicador_ID_Indicador: number; Obtenido: number }[]> {
    return this.http.get<{ indicador_ID_Indicador: number; Obtenido: number }[]>(
      `${this.apiUrl}/puntajes/${evaluacionID}/${asignaturaID}/${estudianteID}`
    );
  }

  obtenerGruposPorEvaluacion(evaluacionID: number, asignaturaID: string): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/grupos/${evaluacionID}/${asignaturaID}`);
  }

  asignarGrupoAGrupo(grupo: any, grupoNumero: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/asignar-grupo`, { grupo, grupoNumero });
  }
  obtenerAplicacionesAgrupadas(evaluacionID: number, asignaturaID: string): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/agrupadas/${evaluacionID}/${asignaturaID}`);
}
disolverGrupo(grupoNumero: number, evaluacionID: number, asignaturaID: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/disolver`, {
    grupo: grupoNumero,
    evaluacionID,
    asignaturaID
  });
}

}
