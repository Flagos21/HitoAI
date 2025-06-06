import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AsignaturaService } from '../../../services/asignatura.service';
import { DialogContenidoComponent } from '../dialog-contenido/dialog-contenido.component';
import { DialogAsignaturaComponent } from '../../admin/asignaturas/dialog-asignatura/dialog-asignatura.component';

@Component({
  selector: 'app-main-asignaturas-jefe',
  standalone: true,
  templateUrl: './main-asignaturas-jefe.component.html',
  styleUrls: ['./main-asignaturas-jefe.component.css'],
  imports: [CommonModule, NgbModalModule, SidebarComponent]
})
export class MainAsignaturasJefeComponent implements OnInit {
  rolUsuario = '';
  asignaturas: any[] = [];

  constructor(
    private modalService: NgbModal,
    private asignaturaService: AsignaturaService
  ) {}

  ngOnInit(): void {
    this.rolUsuario = localStorage.getItem('rol') || '';
    this.cargarAsignaturas();
  }

  cargarAsignaturas() {
    const rut = localStorage.getItem('rut');
    if (!rut) return;

    this.asignaturaService.obtenerPorCarreraDelJefe(rut).subscribe((data) => {
      this.asignaturas = data;
    });
  }

  verAsignatura(asignatura: any) {
    const modalRef = this.modalService.open(DialogAsignaturaComponent, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.modo = 'ver';
    modalRef.componentInstance.datos = asignatura;
  }

  abrirContenidos(asignatura: any) {
    const modalRef = this.modalService.open(DialogContenidoComponent, {
      centered: true,
      size: 'lg',
      backdrop: 'static', // ✅ evita cierre al hacer clic fuera
      keyboard: false, // ✅ evita cierre con tecla Esc
    });

    modalRef.componentInstance.asignaturaID = asignatura.ID_Asignatura;

    modalRef.result
      .then((res) => {
        if (res === 'actualizado') this.cargarAsignaturas();
      })
      .catch(() => {});
  }


}
