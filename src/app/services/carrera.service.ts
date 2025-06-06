import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CarreraService {
  private apiUrl = `${environment.apiUrl}/api/carrera`;

  constructor(private http: HttpClient) {}

  getCarreras(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

  crearCarrera(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear`, data);
  }

  actualizarCarrera(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/actualizar/${id}`, data);
  }

eliminarCarrera(id: number) {
  return this.http.delete(`/api/carrera/eliminar/${id}`);
}

}
