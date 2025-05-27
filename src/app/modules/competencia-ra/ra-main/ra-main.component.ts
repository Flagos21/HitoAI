import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';

import { DialogRaComponent } from '../dialog-ra/dialog-ra.component';
import { DialogCompetenciaComponent } from '../dialog-competencia/dialog-competencia.component';
import { CommonModule } from '@angular/common';
import { RaService } from '../../../services/ra.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-main-ra',
  standalone: true,
  templateUrl: './ra-main.component.html',
  styleUrls: ['./ra-main.component.css'],
  imports: [CommonModule, NgbModalModule, SidebarComponent]
})
export class MainRaComponent implements OnInit {
  resultados: any[] = [];
  seleccionada: any = null;
  rolUsuario: string = '';

  constructor(
    private raService: RaService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.rolUsuario = localStorage.getItem('rol') || '';
    this.cargarRA();
  }

  cargarRA() {
    this.raService.obtenerTodos().subscribe(data => {
      this.resultados = data;
    });
  }

  seleccionar(ra: any) {
    this.seleccionada = ra;
  }

  abrirDialog(modo: 'crear' | 'ver' | 'editar') {
    const modalRef = this.modalService.open(DialogRaComponent, { centered: true });
    modalRef.componentInstance.modo = modo;
    modalRef.componentInstance.datos = modo === 'crear' ? null : this.seleccionada;

    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarRA();
    });
  }

  abrirDialogCompetencias() {
    const modalRef = this.modalService.open(DialogCompetenciaComponent, { centered: true, size: 'lg' });
    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarRA();
    });
  }
}
