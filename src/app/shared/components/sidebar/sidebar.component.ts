import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  constructor(private router: Router, public themeService: ThemeService) {}
  @Input() rol: string = '';

  toggleTheme() {
    this.themeService.toggleDarkMode();
  }

cerrarSesion() {
  localStorage.clear(); // o sessionStorage.clear();
  this.router.navigate(['/login']);
}

}
