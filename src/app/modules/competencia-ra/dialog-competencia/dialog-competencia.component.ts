import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CompetenciaService } from '../../../services/competencia.service';
import { DialogFormCompetenciaComponent } from '../dialog-form-competencia/dialog-form-competencia.component';

@Component({
  selector: 'app-dialog-competencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-competencia.component.html',
  styleUrls: ['./dialog-competencia.component.css']
})
export class DialogCompetenciaComponent implements OnInit {
  competencias: any[] = [];
  seleccionada: any = null;
  bloqueado = false;

  constructor(
    public modal: NgbActiveModal,
    private modalService: NgbModal,
    private competenciaService: CompetenciaService
  ) {}

  ngOnInit(): void {
    this.cargarCompetencias();
  }

  cargarCompetencias() {
    this.competenciaService.obtenerTodas().subscribe(data => {
      this.competencias = data;
    });
  }

  seleccionar(comp: any) {
    this.seleccionada = comp;
  }

  nuevaCompetencia() {
    this.abrirFormulario('crear');
  }

  verCompetencia() {
    if (this.seleccionada) this.abrirFormulario('ver');
  }

  editarCompetencia() {
    if (this.seleccionada) this.abrirFormulario('editar');
  }

  abrirFormulario(modo: 'crear' | 'ver' | 'editar') {
    const modalRef = this.modalService.open(DialogFormCompetenciaComponent, { centered: true });
    modalRef.componentInstance.modo = modo;
    modalRef.componentInstance.datos = modo === 'crear' ? null : this.seleccionada;

    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarCompetencias();
    }).catch(() => {});
  }

  cancelar() {
    this.modal.dismiss();
  }
}
