import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { RaService } from '../../../services/ra.service';
import { CompetenciaService } from '../../../services/competencia.service';
import { AsignaturaService } from '../../../services/asignatura.service';

@Component({
  selector: 'app-dialog-ra',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-ra.component.html',
  styleUrls: ['./dialog-ra.component.css']
})
export class DialogRaComponent implements OnInit {
  @Input() modo: 'crear' | 'ver' | 'editar' = 'crear';
  @Input() datos: any = null;

  competencias: any[] = [];
  asignaturas: any[] = [];
  competenciasSeleccionadas: string[] = [];

  ra = {
    ID_RA: '',
    Nombre: '',
    Descripcion: '',
    asignatura_ID_Asignatura: ''
  };

  bloqueado = false;
  mensajeExito = '';
  mensajeError = '';
  accionConfirmada: 'crear' | 'actualizar' | 'eliminar' | null = null;
  private modalCerrado = false;

  constructor(
    public modal: NgbActiveModal,
    private raService: RaService,
    private competenciaService: CompetenciaService,
    private asignaturaService: AsignaturaService
  ) {}

  ngOnInit(): void {
    const rut = localStorage.getItem('rut') || '';
    if (rut) {
      this.asignaturaService.obtenerPorCarreraDelJefe(rut).subscribe(data => {
        this.asignaturas = data;
      });
    }

    this.competenciaService.obtenerTodas().subscribe(data => {
      this.competencias = data;
    });

    if (this.datos) {
      this.ra = {
        ID_RA: this.datos.ID_RA,
        Nombre: this.datos.Nombre,
        Descripcion: this.datos.Descripcion,
        asignatura_ID_Asignatura: this.datos.asignatura_ID_Asignatura
      };
      this.competenciasSeleccionadas = this.datos.competencias?.split(' + ') || [];
    }
  }

  toggleSeleccion(id: string) {
    const i = this.competenciasSeleccionadas.indexOf(id);
    if (i === -1) {
      this.competenciasSeleccionadas.push(id);
    } else {
      this.competenciasSeleccionadas.splice(i, 1);
    }
  }

  mostrarSeleccionadas(): string {
    return this.competencias
      .filter(c => this.competenciasSeleccionadas.includes(c.ID_Competencia))
      .map(c => c.ID_Competencia)
      .join(' + ');
  }

  crearRA() {
    if (!this.ra.Nombre || !this.ra.Descripcion || !this.ra.asignatura_ID_Asignatura || this.competenciasSeleccionadas.length === 0) {
      this.mensajeError = 'Por favor, complete todos los campos antes de continuar.';
      setTimeout(() => (this.mensajeError = ''), 3000);
      return;
    }

    if (!this.accionConfirmada) {
      this.accionConfirmada = 'crear';
      return;
    }

    this.bloqueado = true;
    this.mensajeExito = 'Resultado de aprendizaje creado con éxito';

    const { ID_RA, ...raSinID } = this.ra;
    const payload = { ...raSinID, competencias: this.competenciasSeleccionadas };

    this.raService.crear(payload).subscribe(() => {
      setTimeout(() => this.cerrarConExito(), 1500);
    });
  }

  actualizarRA() {
    if (!this.ra.Nombre || !this.ra.Descripcion || !this.ra.asignatura_ID_Asignatura || this.competenciasSeleccionadas.length === 0) {
      this.mensajeError = 'Por favor, complete todos los campos antes de continuar.';
      setTimeout(() => (this.mensajeError = ''), 3000);
      return;
    }

    if (!this.accionConfirmada) {
      this.accionConfirmada = 'actualizar';
      return;
    }

    this.bloqueado = true;
    this.mensajeExito = 'Resultado actualizado correctamente';

    const payload = { ...this.ra, competencias: this.competenciasSeleccionadas };
    this.raService.actualizar(this.ra.ID_RA, payload).subscribe(() => {
      setTimeout(() => this.cerrarConExito(), 1500);
    });
  }

  eliminarRA() {
    if (!this.accionConfirmada) {
      this.accionConfirmada = 'eliminar';
      return;
    }

    this.bloqueado = true;
    this.mensajeExito = 'Resultado eliminado';
    this.raService.eliminar(this.ra.ID_RA).subscribe(() => {
      setTimeout(() => this.cerrarConExito(), 1500);
    });
  }

  cancelarConfirmacion() {
    this.accionConfirmada = null;
  }

  cancelar() {
    this.modal.dismiss();
  }

  cerrarToast() {
    this.cerrarConExito();
  }

  private cerrarConExito() {
    if (this.modalCerrado) return;
    this.modalCerrado = true;
    this.modal.close('actualizado');
  }
}
