import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompetenciaService } from '../../../services/competencia.service';


@Component({
  selector: 'app-dialog-form-competencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-form-competencia.component.html',
  styleUrls: ['./dialog-form-competencia.component.css']
})
export class DialogFormCompetenciaComponent implements OnInit {
  @Input() modo: 'crear' | 'ver' | 'editar' = 'crear';
  @Input() datos: any = null;

  competencia = {
    ID_Competencia: '',
    Nombre: '',
    Tipo: ''
  };

  mensajeExito = '';
  mensajeError = '';

  accionConfirmada: 'crear' | 'actualizar' | 'eliminar' | null = null;
  bloqueado = false;
  private modalCerrado = false;

  constructor(public modal: NgbActiveModal, private competenciaService: CompetenciaService) {}

  ngOnInit(): void {
    if (this.datos) {
      this.competencia = { ...this.datos };
    }
  }

  cancelar() {
    if (!this.bloqueado) this.modal.dismiss();
  }

  cancelarConfirmacion() {
    this.accionConfirmada = null;
  }

  cerrarToast() {
    this.cerrarConExito();
  }
crear() {
  if (!this.competencia.ID_Competencia || !this.competencia.Nombre || !this.competencia.Tipo) {
    this.mensajeError = 'Por favor, complete todos los campos antes de continuar.';
    setTimeout(() => this.mensajeError = '', 3000);
    return;
  }

  if (!this.accionConfirmada) {
    this.accionConfirmada = 'crear';
    return;
  }

  this.bloqueado = true;
  this.mensajeExito = 'Competencia creada con éxito';
  this.competenciaService.crear(this.competencia).subscribe(() => {
    setTimeout(() => this.cerrarConExito(), 1500);
  });
}


  actualizar() {
    if (!this.competencia.Nombre || !this.competencia.Tipo) {
      alert('Por favor, complete todos los campos antes de continuar.');
      return;
    }

    if (!this.accionConfirmada) {
      this.accionConfirmada = 'actualizar';
      return;
    }

    this.bloqueado = true;
    this.mensajeExito = 'Competencia actualizada correctamente';
    this.competenciaService
      .actualizar(this.competencia.ID_Competencia, this.competencia)
      .subscribe(() => {
        setTimeout(() => this.cerrarConExito(), 1500);
      });
  }

  eliminar() {
    if (!this.accionConfirmada) {
      this.accionConfirmada = 'eliminar';
      return;
    }

    this.bloqueado = true;
    this.mensajeExito = 'Competencia eliminada';
    this.competenciaService.eliminar(this.competencia.ID_Competencia).subscribe(() => {
      setTimeout(() => this.cerrarConExito(), 1500);
    });
  }

  private cerrarConExito() {
    if (this.modalCerrado) return;
    this.modalCerrado = true;
    this.modal.close('actualizado');
  }
}
