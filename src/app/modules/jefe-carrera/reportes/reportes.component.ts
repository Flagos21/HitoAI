import { Component, OnInit } from '@angular/core';
import { AsignaturaService } from '../../../services/asignatura.service';
import { ReporteService } from '../../../services/reporte.service';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-reportes',
  standalone: true,

  imports: [CommonModule, SidebarComponent],

  templateUrl: './reportes.component.html'
})
export class ReportesComponent implements OnInit {
  asignaturas: any[] = [];
  rut = localStorage.getItem('rut') || '';

  constructor(private asignaturaService: AsignaturaService, private reporteService: ReporteService) {}

  ngOnInit() {
    this.asignaturaService.obtenerPorCarreraDelJefe(this.rut).subscribe(a => this.asignaturas = a);
  }

  generar(id: number) {
    this.reporteService.generar(id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Informe-${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
