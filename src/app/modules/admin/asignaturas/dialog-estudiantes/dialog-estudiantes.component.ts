import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EstudianteService } from '../../../../services/estudiante.service';
import { DialogFormEstudianteComponent } from '../dialog-form-estudiante/dialog-form-estudiante.component';
import { Estudiante } from '../../../../models';
import { RutFormatPipe } from '../../../../pipes/rut-format.pipe';

@Component({
  selector: 'app-dialog-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule, RutFormatPipe],
  templateUrl: './dialog-estudiantes.component.html',
  styleUrls: ['./dialog-estudiantes.component.css']
})
export class DialogEstudiantesComponent implements OnInit {
  estudiantes: Estudiante[] = [];
  bloqueado = false;
  mensajeCSV = '';
  mostrarToastCSV = false;

  constructor(
    public modal: NgbActiveModal,
    private modalService: NgbModal,
    private estudianteService: EstudianteService
  ) {}

  ngOnInit(): void {
    this.cargarEstudiantes();
  }

  cargarEstudiantes() {
    this.estudianteService.obtenerTodos().subscribe(data => {
      this.estudiantes = data;
    });
  }

  nuevoEstudiante() {
    this.abrirFormulario('crear');
  }

  abrirFormulario(modo: 'crear' | 'ver' | 'editar', est?: Estudiante) {
    const modalRef = this.modalService.open(DialogFormEstudianteComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.modo = modo;
    modalRef.componentInstance.datos = modo === 'crear' ? null : est;

    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarEstudiantes();
    }).catch(() => {});
  }

  cargarCSV(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
      this.estudianteService.cargarDesdeCSV(archivo).subscribe((resp) => {
        this.mensajeCSV = resp.message || 'Estudiantes cargados';
        this.mostrarToastCSV = true;
        this.cargarEstudiantes();

        setTimeout(() => this.mostrarToastCSV = false, 3000);
      });
    }
  }

  cancelar() {
    this.modal.dismiss();
  }
}
