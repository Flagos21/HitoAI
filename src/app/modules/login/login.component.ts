import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [CommonModule, FormsModule],
})
export class LoginComponent {
  usuario = {
    ID_Usuario: '',
    Clave: ''
  };

  constructor(private usuarioService: UsuarioService, private router: Router) {}

  login() {
    this.usuarioService.login(this.usuario).subscribe({
      next: (res: any) => {
        const rol = res.Rol?.toLowerCase();

        // ✅ Guardar el RUT e identificar el usuario correctamente
        localStorage.setItem('rol', res.Rol);
        localStorage.setItem('rut', res.ID_Usuario);

        if (rol === 'administrador') this.router.navigate(['/admin']);
        else if (rol === 'jefe de carrera') this.router.navigate(['/jefe-carrera']);
        else if (rol === 'profesor') this.router.navigate(['/profesor']);
        else if (rol === 'comité curricular' || rol === 'comite curricular') this.router.navigate(['/comite']);
        else alert('Rol no reconocido');
      },
      error: () => alert('RUT o clave incorrecta')
    });
  }
}
