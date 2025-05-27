import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(private router: Router) {}
  @Input() rol: string = '';

  cerrarSesion() {
  // Aquí puedes limpiar localStorage, sessionStorage, etc. si usas autenticación
  this.router.navigate(['/login']);
}
}
