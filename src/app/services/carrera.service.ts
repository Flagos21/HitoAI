import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { Carrera } from '../models/carrera.model';

@Injectable({
  providedIn: 'root'
})
export class CarreraService {
  private apiUrl = `${environment.apiUrl}/api/carrera`;

  constructor(private http: HttpClient) {}

  getCarreras(): Observable<Carrera[]> {
    return this.http.get<Carrera[]>(`${this.apiUrl}`);
  }

  crearCarrera(data: Carrera): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, data);
  }

  actualizarCarrera(id: number, data: Carrera): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, data);
  }

  eliminarCarrera(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/eliminar/${id}`);
  }

}
