import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private apiUrl = `${environment.apiUrl}/api/usuario`;

  constructor(private http: HttpClient) {}

  crearUsuario(usuario: any) {
    return this.http.post(`${this.apiUrl}/crear`, usuario);
  }

  login(data: any) {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  getJefesCarrera() {
    return this.http.get<any[]>(`${this.apiUrl}/jefes`);
  }
getProfesores() {
  return this.http.get<any[]>(`${this.apiUrl}/profesores`);
}


}
