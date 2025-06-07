import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface SolicitudClave {
  id: number;
  rut: string;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class MensajeService {
  private apiUrl = `${environment.apiUrl}/api/mensaje`;
  constructor(private http: HttpClient) {}

  solicitarReinicio(rut: string) {
    return this.http.post(`${this.apiUrl}/solicitar-clave`, { rut });
  }

  getSolicitudes() {
    return this.http.get<SolicitudClave[]>(`${this.apiUrl}/solicitudes`);
  }
}
