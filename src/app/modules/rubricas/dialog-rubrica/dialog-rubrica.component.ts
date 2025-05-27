import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { IndicadorService } from '../../../services/indicador.service';
import { DialogFormIndicadorComponent } from '../dialog-form-indicador/dialog-form-indicador.component';

@Component({
  selector: 'app-dialog-rubrica',
  standalone: true,
  templateUrl: './dialog-rubrica.component.html',
  styleUrls: ['./dialog-rubrica.component.css'],
  imports: [CommonModule]
})
export class DialogRubricaComponent implements OnInit {
  @Input() contenidoID!: number;

  indicadores: any[] = [];
  seleccionado: any = null;

  constructor(
    public modal: NgbActiveModal,
    private modalService: NgbModal,
    private indicadorService: IndicadorService
  ) {}

  ngOnInit(): void {
    this.cargarRubrica();
  }

  cargarRubrica() {
    this.indicadorService.obtenerPorContenido(this.contenidoID).subscribe(data => {
      this.indicadores = data.map(ind => ({
        ...ind,
        Criterios: [...ind.Criterios].sort((a, b) => a.R_Min - b.R_Min)
      }));
    });
  }

  seleccionar(indicador: any) {
    this.seleccionado = indicador;
  }

  agregarIndicador() {
    const modalRef = this.modalService.open(DialogFormIndicadorComponent, { centered: true, size: 'lg' });
    modalRef.componentInstance.modo = 'crear';
    modalRef.componentInstance.datos = {
      contenido_ID_Contenido: this.contenidoID,
      ra_ID_RA: null
    };

    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarRubrica();
    }).catch(() => {});
  }

  editarIndicador() {
    if (!this.seleccionado) return;
    const modalRef = this.modalService.open(DialogFormIndicadorComponent, { centered: true, size: 'lg' });
    modalRef.componentInstance.modo = 'editar';
    modalRef.componentInstance.datos = this.seleccionado;

    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarRubrica();
    }).catch(() => {});
  }
get columnasMaximas(): number[] {
  const max = Math.max(...this.indicadores.map(i => i.Criterios.length), 0);
  return Array.from({ length: max }, (_, i) => i);
}

  verIndicador() {
    if (!this.seleccionado) return;
    const modalRef = this.modalService.open(DialogFormIndicadorComponent, { centered: true, size: 'lg' });
    modalRef.componentInstance.modo = 'ver';
    modalRef.componentInstance.datos = this.seleccionado;
  }

  get criteriosPorIndice(): any[][] {
    const max = Math.max(...this.indicadores.map(i => i.Criterios.length));
    const filas: any[][] = [];

    for (let i = 0; i < max; i++) {
      const fila = this.indicadores.map(ind => ind.Criterios[i] || null);
      filas.push(fila);
    }

    return filas;
  }

  cancelar() {
    this.modal.dismiss();
  }
}
