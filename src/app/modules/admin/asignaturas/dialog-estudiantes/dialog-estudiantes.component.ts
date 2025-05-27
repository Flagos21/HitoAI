import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EstudianteService } from '../../../../services/estudiante.service';
import { DialogFormEstudianteComponent } from '../dialog-form-estudiante/dialog-form-estudiante.component';

@Component({
  selector: 'app-dialog-estudiantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-estudiantes.component.html',
  styleUrls: ['./dialog-estudiantes.component.css']
})
export class DialogEstudiantesComponent implements OnInit {
  estudiantes: any[] = [];
  seleccionado: any = null;
  bloqueado = false;
  mensajeCSV = '';
  mostrarToastCSV = false;

  constructor(
    public modal: NgbActiveModal,
    private modalService: NgbModal,
    private estudianteService: EstudianteService
  ) {}

  ngOnInit(): void {
    this.cargarEstudiantesNoInscritos();
  }

  cargarEstudiantesNoInscritos() {
    this.estudianteService.obtenerNoInscritos().subscribe(data => {
      this.estudiantes = data;
    });
  }

  seleccionar(est: any) {
    this.seleccionado = est;
  }

  nuevoEstudiante() {
    this.abrirFormulario('crear');
  }

  verEstudiante() {
    if (this.seleccionado) this.abrirFormulario('ver');
  }

  editarEstudiante() {
    if (this.seleccionado) this.abrirFormulario('editar');
  }

  abrirFormulario(modo: 'crear' | 'ver' | 'editar') {
    const modalRef = this.modalService.open(DialogFormEstudianteComponent, { centered: true });
    modalRef.componentInstance.modo = modo;
    modalRef.componentInstance.datos = modo === 'crear' ? null : this.seleccionado;

    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarEstudiantesNoInscritos();
    }).catch(() => {});
  }

  cargarCSV(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
      this.estudianteService.cargarDesdeCSV(archivo).subscribe((resp) => {
        this.mensajeCSV = resp.message || 'Estudiantes cargados';
        this.mostrarToastCSV = true;
        this.cargarEstudiantesNoInscritos();

        setTimeout(() => this.mostrarToastCSV = false, 3000);
      });
    }
  }

  cancelar() {
    this.modal.dismiss();
  }
}
