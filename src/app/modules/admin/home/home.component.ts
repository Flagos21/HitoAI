import { Component } from '@angular/core';
import { UsuarioService } from '../../../services/usuario.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';


declare const bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'], // o .css si cambiaste
  imports: [CommonModule, FormsModule, SidebarComponent],
})
export class HomeComponent {
  usuario = {
    ID_Usuario: '',
    Nombre: '',
    Clave: '',
    Rol: ''
  };

  constructor(private usuarioService: UsuarioService) {}

  abrirModal() {
    const modal = new bootstrap.Modal(document.getElementById('registroUsuarioModal'));
    modal.show();
  }

  registrarUsuario() {
    this.usuarioService.crearUsuario(this.usuario).subscribe({
      next: () => {
        alert('Usuario registrado correctamente');
        this.usuario = { ID_Usuario: '', Nombre: '', Clave: '', Rol: '' };
      },
      error: () => alert('Error al registrar usuario')
    });
  }
}
