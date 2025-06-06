import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UsuarioService } from '../../../../services/usuario.service';
import { Usuario } from '../../../../models';

@Component({
  selector: 'app-dialog-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-usuario.component.html',
  styleUrls: ['./dialog-usuario.component.css']
})
export class DialogUsuarioComponent {
  @Input() modo: 'ver' | 'editar' = 'ver';
  @Input() datos: Usuario | null = null;

  usuario: Usuario = { ID_Usuario: '', Nombre: '', Rol: '' };
  nuevaClave = '';
  confirmar = '';
  mensajeExito = '';
  mensajeError = '';
  bloqueado = false;
  private modalCerrado = false;

  constructor(public modal: NgbActiveModal, private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    if (this.datos) {
      this.usuario = { ...this.datos };
    }
  }

  renovarClave() {
    if (!this.nuevaClave || !this.confirmar) {
      this.mensajeError = 'Debe ingresar la nueva clave en ambos campos.';
      setTimeout(() => (this.mensajeError = ''), 3000);
      return;
    }
    if (this.nuevaClave !== this.confirmar) {
      this.mensajeError = 'Las claves no coinciden.';
      setTimeout(() => (this.mensajeError = ''), 3000);
      return;
    }

    if (this.bloqueado) return;
    this.bloqueado = true;
    this.usuarioService.actualizarClave(this.usuario.ID_Usuario, this.nuevaClave).subscribe(() => {
      this.mensajeExito = 'Clave actualizada';
      setTimeout(() => this.cerrarConExito(), 1500);
    });
  }

  cancelar() {
    if (!this.bloqueado) this.modal.dismiss();
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
