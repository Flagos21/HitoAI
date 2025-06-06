import { Component } from '@angular/core';
import { UsuarioService } from '../../../services/usuario.service';
import { RolService } from '../../../services/rol.service'; // NUEVO
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';

declare const bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, FormsModule, SidebarComponent],
})
export class HomeComponent {
  rolUsuario = localStorage.getItem('rol') || '';

  usuario = {
    ID_Usuario: '',
    Nombre: '',
    Clave: '',
    Rol_ID_Rol: ''
  };

  roles: any[] = [];

  constructor(
    private usuarioService: UsuarioService,
    private rolService: RolService
  ) {}

  ngOnInit() {
    this.rolService.getRoles().subscribe({
      next: (data) => (this.roles = data),
      error: () => alert('Error al cargar los roles')
    });
  }

  abrirModal() {
    const modal = new bootstrap.Modal(document.getElementById('registroUsuarioModal'));
    modal.show();
  }

  registrarUsuario() {
    this.usuarioService.crearUsuario(this.usuario).subscribe({
      next: () => {
        alert('Usuario registrado correctamente');
        this.usuario = { ID_Usuario: '', Nombre: '', Clave: '', Rol_ID_Rol: '' };
      },
      error: () => alert('Error al registrar usuario')
    });
  }
}
