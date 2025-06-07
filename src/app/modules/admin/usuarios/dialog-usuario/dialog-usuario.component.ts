import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UsuarioService } from '../../../../services/usuario.service';
import { RolService } from '../../../../services/rol.service';
import { Usuario, Rol } from '../../../../models';
import { cleanRut, validarRut } from '../../../../utils/rut';
import { claveSegura } from '../../../../utils/clave';

@Component({
  selector: 'app-dialog-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog-usuario.component.html',
  styleUrls: ['./dialog-usuario.component.css']
})
export class DialogUsuarioComponent {
  @Input() modo: 'crear' | 'ver' | 'editar' = 'ver';
  @Input() datos: Usuario | null = null;

  usuario: Usuario = { ID_Usuario: '', Nombre: '', Rol: '', Clave: '', Rol_ID_Rol: '' };
  roles: Rol[] = [];
  nuevaClave = '';
  confirmar = '';
  mensajeExito = '';
  mensajeError = '';
  bloqueado = false;
  accionConfirmada: 'crear' | 'actualizar' | null = null;
  private modalCerrado = false;

  constructor(
    public modal: NgbActiveModal,
    private usuarioService: UsuarioService,
    private rolService: RolService
  ) {}

  ngOnInit(): void {
    if (this.modo === 'crear') {
      this.rolService.getRoles().subscribe({
        next: data => (this.roles = data),
        error: () => (this.mensajeError = 'Error al cargar roles')
      });
    }
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
    if (!claveSegura(this.nuevaClave)) {
      this.mensajeError =
        'La clave debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos.';
      setTimeout(() => (this.mensajeError = ''), 3000);
      return;
    }
    if (this.nuevaClave !== this.confirmar) {
      this.mensajeError = 'Las claves no coinciden.';
      setTimeout(() => (this.mensajeError = ''), 3000);
      return;
    }
    if (!this.accionConfirmada) {
      this.accionConfirmada = 'actualizar';
      return;
    }

    if (this.bloqueado) return;
    this.bloqueado = true;
    this.usuarioService
      .actualizarClave(this.usuario.ID_Usuario, this.nuevaClave)
      .subscribe(() => {
        this.mensajeExito = 'Clave actualizada';
        setTimeout(() => this.cerrarConExito(), 1500);
      });
  }

  crear() {
    if (
      !this.usuario.ID_Usuario ||
      !this.usuario.Nombre ||
      !this.usuario.Clave ||
      !this.usuario.Rol_ID_Rol
    ) {
      this.mensajeError = 'Complete todos los campos.';
      setTimeout(() => (this.mensajeError = ''), 3000);
      return;
    }

    if (!claveSegura(this.usuario.Clave)) {
      this.mensajeError =
        'La clave debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos.';
      setTimeout(() => (this.mensajeError = ''), 3000);
      return;
    }

    if (!validarRut(this.usuario.ID_Usuario)) {
      this.mensajeError = 'RUT inválido';
      setTimeout(() => (this.mensajeError = ''), 3000);
      return;
    }

    this.usuario.ID_Usuario = cleanRut(this.usuario.ID_Usuario);

    if (!this.accionConfirmada) {
      this.accionConfirmada = 'crear';
      return;
    }

    if (this.bloqueado) return;
    this.bloqueado = true;
    this.usuarioService.crearUsuario(this.usuario).subscribe(() => {
      this.mensajeExito = 'Usuario creado';
      setTimeout(() => this.cerrarConExito(), 1500);
    });
  }

  cancelar() {
    if (!this.bloqueado) this.modal.dismiss();
  }

  cancelarConfirmacion() {
    this.accionConfirmada = null;
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
