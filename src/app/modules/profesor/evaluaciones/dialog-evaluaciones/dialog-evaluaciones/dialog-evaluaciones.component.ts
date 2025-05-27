import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EvaluacionService } from '../../../../../services/evaluacion.service';
import { DialogCrearEvaluacionComponent } from '../../dialog-crear-evaluacion/dialog-crear-evaluacion/dialog-crear-evaluacion.component';
import { MainEvaluacionDetalleComponent } from '../../main-evaluacion-detalle/main-evaluacion-detalle/main-evaluacion-detalle.component';

@Component({
  selector: 'app-dialog-evaluaciones',
  standalone: true,
  templateUrl: './dialog-evaluaciones.component.html',
  styleUrls: ['./dialog-evaluaciones.component.css'],
  imports: [CommonModule, FormsModule]
})
export class DialogEvaluacionesComponent implements OnInit {
  @Input() asignatura: any;

  evaluaciones: any[] = [];

  constructor(
    public modal: NgbActiveModal,
    private modalService: NgbModal,
    private evaluacionService: EvaluacionService
  ) {}

  ngOnInit(): void {
    this.cargarEvaluaciones();
  }

  cargarEvaluaciones() {
    this.evaluacionService.obtenerPorAsignatura(this.asignatura.ID_Asignatura).subscribe(data => {
      this.evaluaciones = data;
    }, error => {
      console.error('Error al cargar evaluaciones:', error);
    });
  }

  abrirDialogCrearEvaluacion() {
    const modalRef = this.modalService.open(DialogCrearEvaluacionComponent, { centered: true, size: 'lg' });
    modalRef.componentInstance.asignatura = this.asignatura;

    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarEvaluaciones();
    }).catch(() => {});
  }

  abrirDetalleEvaluacion(evaluacionID: number) {
    const modalRef = this.modalService.open(MainEvaluacionDetalleComponent, { centered: true, size: 'xl', scrollable: true });
    modalRef.componentInstance.evaluacionID = evaluacionID;
    modalRef.componentInstance.asignaturaID = this.asignatura.ID_Asignatura;

    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarEvaluaciones();
    }).catch(() => {});
  }

  cerrar() {
    this.modal.close();
  }
}
