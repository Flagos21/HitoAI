import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { AsignaturaService } from '../../../services/asignatura.service';
import { DialogEvaluacionesComponent } from '../../profesor/evaluaciones/dialog-evaluaciones/dialog-evaluaciones/dialog-evaluaciones.component';

@Component({
  selector: 'app-main-asignaturas-profesor',
  standalone: true,
  templateUrl: './main-asignaturas-profesor.component.html',
  styleUrls: ['./main-asignaturas-profesor.component.css'],
  imports: [CommonModule, NgbModalModule, SidebarComponent]
})
export class MainAsignaturasProfesorComponent implements OnInit {
  rolUsuario = '';
  asignaturas: any[] = [];
  seleccionada: any = null;

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
    if (!rut) {
      console.warn('❌ RUT del profesor no encontrado en localStorage');
      return;
    }

    this.asignaturaService.obtenerPorProfesor(rut).subscribe(data => {
      this.asignaturas = data;
    }, error => {
      console.error('❌ Error al cargar asignaturas del profesor:', error);
    });
  }

  seleccionar(asignatura: any) {
    this.seleccionada = asignatura;
  }

  verAsignatura() {
    if (!this.seleccionada) return;
    alert(`Ver asignatura: ${this.seleccionada.Nombre}`);
  }

  abrirEvaluaciones() {
    if (!this.seleccionada) return;
    const modalRef = this.modalService.open(DialogEvaluacionesComponent, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.asignatura = this.seleccionada;

    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarAsignaturas();
    }).catch(() => {});
  }
}
