import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { MensajeService, SolicitudClave } from '../../../../services/mensaje.service';

@Component({
  selector: 'app-main-solicitudes',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  templateUrl: './main-solicitudes.component.html',
  styleUrls: ['./main-solicitudes.component.css']
})
export class MainSolicitudesComponent implements OnInit {
  rolUsuario = '';
  solicitudes: SolicitudClave[] = [];

  constructor(private mensajeService: MensajeService) {}

  ngOnInit(): void {
    this.rolUsuario = localStorage.getItem('rol') || '';
    this.cargar();
  }

  cargar() {
    this.mensajeService.getSolicitudes().subscribe(data => (this.solicitudes = data));
  }
}
