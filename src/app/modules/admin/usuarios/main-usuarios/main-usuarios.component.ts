import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { UsuarioService } from '../../../../services/usuario.service';
import { Usuario } from '../../../../models';
import { SidebarComponent } from '../../../../shared/components/sidebar/sidebar.component';
import { DialogUsuarioComponent } from '../dialog-usuario/dialog-usuario.component';

@Component({
  selector: 'app-main-usuarios',
  standalone: true,
  imports: [CommonModule, NgbModalModule, SidebarComponent],
  templateUrl: './main-usuarios.component.html',
  styleUrls: ['./main-usuarios.component.css']
})
export class MainUsuariosComponent implements OnInit {
  rolUsuario: string = '';
  agrupados: { rol: string; usuarios: Usuario[] }[] = [];

  constructor(private usuarioService: UsuarioService, private modalService: NgbModal) {}

  ngOnInit(): void {
    this.rolUsuario = localStorage.getItem('rol') || '';
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usuarioService.getUsuarios().subscribe(data => {
      const mapa: { [k: string]: Usuario[] } = {};
      for (const u of data) {
        const key = u.Rol || 'Sin Rol';
        if (!mapa[key]) mapa[key] = [];
        mapa[key].push(u);
      }
      this.agrupados = Object.keys(mapa).map(k => ({ rol: k, usuarios: mapa[k] }));
    });
  }

  abrirDialog(modo: 'crear' | 'ver' | 'editar', usuario?: Usuario) {
    const modalRef = this.modalService.open(DialogUsuarioComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.modo = modo;
    modalRef.componentInstance.datos = modo === 'crear' ? null : usuario!;
    modalRef.result.then(res => {
      if (res === 'actualizado') this.cargarUsuarios();
    }).catch(() => {});
  }
}
