import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EstudianteService } from '../../../../services/estudiante.service';
import { InscripcionService } from '../../../../services/inscripcion.service';
import { Asignatura, Estudiante, Inscripcion } from '../../../../models';
import { RutFormatPipe } from '../../../../pipes/rut-format.pipe';
import { cleanRut } from '../../../../utils/rut';


@Component({
  selector: 'app-dialog-inscripcion',
  standalone: true,
  imports: [CommonModule, FormsModule, RutFormatPipe],
  templateUrl: './dialog-inscripcion.component.html',
  styleUrls: ['./dialog-inscripcion.component.css']
})
export class DialogInscripcionComponent implements OnInit {
  @Input() asignatura!: Asignatura;

  estudiantes: (Estudiante & { seleccionado: boolean })[] = [];
  filtro: string = '';
  mensajeExito = '';
  bloqueado = false;
  private modalCerrado = false;

  constructor(
    public modal: NgbActiveModal,
    private estudianteService: EstudianteService,
    private inscripcionService: InscripcionService
  ) {}

  ngOnInit(): void {
    this.cargarEstudiantesDisponibles();
  }

  cargarEstudiantesDisponibles() {
    this.estudianteService.obtenerDisponibles(this.asignatura.ID_Asignatura).subscribe(data => {
      this.estudiantes = data.map(e => ({ ...e, seleccionado: false }));
    });
  }

  estudiantesFiltrados() {
    const f = this.filtro.toLowerCase();
    const fRut = cleanRut(this.filtro).toLowerCase();
    return this.estudiantes.filter(e =>
      cleanRut(e.ID_Estudiante).toLowerCase().includes(fRut) ||
      e.Nombre.toLowerCase().includes(f) ||
      e.Apellido.toLowerCase().includes(f)
    );
  }

  haySeleccionados(): boolean {
    return this.estudiantes.some(e => e.seleccionado);
  }

  confirmarInscripcion() {
    if (!this.haySeleccionados()) return;

    const seleccionados = this.estudiantes
      .filter(e => e.seleccionado)
      .map(e => e.ID_Estudiante);

    const inscripciones = seleccionados.map(id => ({
      estudiante_ID_Estudiante: id,
      asignatura_ID_Asignatura: this.asignatura.ID_Asignatura,
      Anio: new Date().getFullYear(),
      Semestre: this.asignatura.Semestre
    }));

    this.bloqueado = true;
    this.mensajeExito = 'Estudiantes inscritos correctamente';

    this.inscripcionService.inscribir(inscripciones).subscribe(() => {
      setTimeout(() => this.cerrarConExito(), 1500);
    });
  }

  cerrarToast() {
    this.cerrarConExito();
  }

  cancelar() {
    if (!this.bloqueado) this.modal.dismiss();
  }

  private cerrarConExito() {
    if (this.modalCerrado) return;
    this.modalCerrado = true;
    this.modal.close('actualizado');
  }
}
