import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ContenidoService } from '../../../services/contenido.service';
import { DialogFormContenidoComponent } from '../dialog-form-contenido/dialog-form-contenido.component';
import { DialogRubricaComponent } from '../dialog-rubrica/dialog-rubrica.component';

@Component({
  selector: 'app-dialog-contenido',
  standalone: true,
  templateUrl: './dialog-contenido.component.html',
  styleUrls: ['./dialog-contenido.component.css'],
  imports: [CommonModule, FormsModule, NgbModalModule]
})
export class DialogContenidoComponent implements OnInit {
  @Input() asignaturaID: string = '';
  contenidos: any[] = [];
  seleccionada: any = null;
  bloqueado = false;

  constructor(
    public modal: NgbActiveModal,
    private modalService: NgbModal,
    private contenidoService: ContenidoService
  ) {}

  ngOnInit(): void {
    this.cargarContenidos();
  }

  cargarContenidos() {
    this.contenidoService.obtenerPorAsignatura(this.asignaturaID).subscribe(data => {
      this.contenidos = data;
    });
  }

  seleccionar(c: any) {
    this.seleccionada = c;
  }

  nuevaContenido() {
    const modalRef = this.modalService.open(DialogFormContenidoComponent, { centered: true });
    modalRef.componentInstance.modo = 'crear';
    modalRef.componentInstance.asignaturaID = this.asignaturaID;

    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarContenidos();
    }).catch(() => {});
  }

  verContenido() {
    if (!this.seleccionada) return;
    const modalRef = this.modalService.open(DialogFormContenidoComponent, { centered: true });
    modalRef.componentInstance.modo = 'ver';
    modalRef.componentInstance.datos = this.seleccionada;
  }

  editarContenido() {
    if (!this.seleccionada) return;
    const modalRef = this.modalService.open(DialogFormContenidoComponent, { centered: true });
    modalRef.componentInstance.modo = 'editar';
    modalRef.componentInstance.datos = this.seleccionada;

    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarContenidos();
    }).catch(() => {});
  }

  abrirRubrica() {
    if (!this.seleccionada) return;
    const modalRef = this.modalService.open(DialogRubricaComponent, { centered: true, size: 'lg' });
    modalRef.componentInstance.contenidoID = this.seleccionada.ID_Contenido;

    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarContenidos();
    }).catch(() => {});
  }

  cancelar() {
    this.modal.dismiss();
  }
}
