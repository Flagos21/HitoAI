import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

import { DialogRaComponent } from '../dialog-ra/dialog-ra.component';
import { DialogCompetenciaComponent } from '../dialog-competencia/dialog-competencia.component';

import { RaService } from '../../../services/ra.service';
import { AsignaturaService } from '../../../services/asignatura.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-main-ra',
  standalone: true,
  templateUrl: './ra-main.component.html',
  styleUrls: ['./ra-main.component.css'],
  imports: [CommonModule, NgbModalModule, SidebarComponent],
})
export class MainRaComponent implements OnInit {
  resultados: any[] = [];
  agrupadosPorAsignatura: any[] = [];
  rolUsuario: string = '';

  constructor(
    private raService: RaService,
    private asignaturaService: AsignaturaService,
    private modalService: NgbModal,
    private viewContainerRef: ViewContainerRef
  ) {}

  ngOnInit(): void {
    this.rolUsuario = localStorage.getItem('rol') || '';
    this.cargarRA();
  }

  cargarRA() {
    const rut = localStorage.getItem('rut') || '';
    if (!rut) return;

    this.raService.obtenerTodos().subscribe((data) => {
      this.asignaturaService.obtenerPorCarreraDelJefe(rut).subscribe((asignaturas) => {
        const mapa = new Map<string, any>();

        for (let ra of data) {
          const idAsig = ra.asignatura_ID_Asignatura;
          const asignatura = asignaturas.find((a) => a.ID_Asignatura === idAsig);

          if (!asignatura) continue;

          if (!mapa.has(idAsig)) {
            mapa.set(idAsig, {
              asignatura: idAsig,
              nombreAsignatura: asignatura.Nombre,
              ras: [],
            });
          }

          mapa.get(idAsig).ras.push(ra);
        }

        this.agrupadosPorAsignatura = Array.from(mapa.values());
      });
    });
  }

  abrirDialog(modo: 'crear' | 'ver' | 'editar', ra?: any) {
    const modalRef = this.modalService.open(DialogRaComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.modo = modo;
    modalRef.componentInstance.datos = modo === 'crear' ? null : ra;

    modalRef.result.then((res) => {
      if (res === 'actualizado') this.cargarRA();
    });
  }

  abrirDialogCompetencias() {
    const modalRef = this.modalService.open(DialogCompetenciaComponent, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
      injector: this.viewContainerRef.injector,
    });

    modalRef.result.then((res) => {
      if (res === 'actualizado') this.cargarRA();
    });
  }
}
