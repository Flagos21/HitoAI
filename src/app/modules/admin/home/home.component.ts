import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';


@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  imports: [CommonModule, SidebarComponent],
})
export class HomeComponent {
  rolUsuario = localStorage.getItem('rol') || '';

  constructor() {}

  ngOnInit() {}
}
