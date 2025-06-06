import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { DialogAsignaturaComponent } from '../dialog-asignatura/dialog-asignatura.component';
import { DialogEstudiantesComponent } from '../dialog-estudiantes/dialog-estudiantes.component';
import { DialogInscripcionComponent } from '../dialog-inscripcion/dialog-inscripcion.component';
import { AsignaturaService } from '../../../../services/asignatura.service';
import { Asignatura } from '../../../../models';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-main-asignaturas',
  standalone: true,
  imports: [CommonModule, NgbModalModule, SidebarComponent],
  templateUrl: './main-asignaturas.component.html',
  styleUrls: ['./main-asignaturas.component.css']
})
export class MainAsignaturasComponent implements OnInit {
  rolUsuario: string = '';
  asignaturasPorCarrera: { carrera: string; asignaturas: Asignatura[] }[] = [];
  seleccionada: Asignatura | null = null;

  constructor(
    private modalService: NgbModal,
    private asignaturaService: AsignaturaService
  ) {}

  ngOnInit(): void {
    this.rolUsuario = localStorage.getItem('rol') || '';
    this.cargarAsignaturas();
  }

  cargarAsignaturas() {
    this.asignaturaService.obtenerTodas().subscribe(data => {
      const agrupadas: { [key: string]: Asignatura[] } = {};
      for (const a of data) {
        const key = a.Carrera || '';
        if (!agrupadas[key]) agrupadas[key] = [];
        agrupadas[key].push(a);
      }
      this.asignaturasPorCarrera = Object.keys(agrupadas).map(k => ({
        carrera: k,
        asignaturas: agrupadas[k]
      }));
    });
  }

  seleccionar(asignatura: Asignatura) {
    this.seleccionada = asignatura;
  }

  abrirDialog(modo: 'crear' | 'ver' | 'editar', asignatura?: Asignatura | null) {
    const modalRef = this.modalService.open(DialogAsignaturaComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.modo = modo;
    modalRef.componentInstance.datos = modo === 'crear' ? null : asignatura ?? this.seleccionada;

    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarAsignaturas();
    }).catch(() => {});
  }

  abrirDialogEstudiantes() {
    const modalRef = this.modalService.open(DialogEstudiantesComponent, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarAsignaturas();
    }).catch(() => {});
  }

  abrirDialogInscripcion() {
    if (!this.seleccionada) return;
    const modalRef = this.modalService.open(DialogInscripcionComponent, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.asignatura = this.seleccionada;

    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarAsignaturas();
    }).catch(() => {});
  }
}
