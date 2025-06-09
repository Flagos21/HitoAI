import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent as AdminHome } from './modules/admin/home/home.component';
import { HomeComponent as JefeHome } from './modules/jefe-carrera/home/home.component';
import { HomeComponent as ProfesorHome } from './modules/profesor/home/home.component';
import { HomeComponent as ComiteHome } from './modules/comite/home/home.component';
import { LoginComponent } from './modules/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // ADMIN
  { path: 'admin', component: AdminHome, canActivate: [AuthGuard] },
  {
    path: 'admin/carreras',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./modules/admin/carreras/main-carreras/main-carreras.component')
        .then(m => m.MainCarrerasComponent)
  },
  {
    path: 'admin/asignaturas',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./modules/admin/asignaturas/main-asignaturas/main-asignaturas.component')
        .then(m => m.MainAsignaturasComponent)
  },
  {
    path: 'admin/usuarios',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./modules/admin/usuarios/main-usuarios/main-usuarios.component')
        .then(m => m.MainUsuariosComponent)
  },

  // JEFE DE CARRERA
  { path: 'jefe-carrera', component: JefeHome, canActivate: [AuthGuard] },
  {
    path: 'jefe-carrera/asignaturas',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./modules/rubricas/main-asignaturas-jefe/main-asignaturas-jefe.component')
        .then(m => m.MainAsignaturasJefeComponent)
  },
  {
    path: 'jefe-carrera/reportes',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./modules/jefe-carrera/reportes/reportes.component')
        .then(m => m.ReportesComponent)
  },
  {
    path: 'jefe-carrera/ra',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./modules/competencia-ra/ra-main/ra-main.component')
        .then(m => m.MainRaComponent)
  },

  // PROFESOR
  { path: 'profesor', component: ProfesorHome, canActivate: [AuthGuard] },
  {
    path: 'profesor/asignaturas',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./modules/rubricas/main-asignaturas-profesor/main-asignaturas-profesor.component')
        .then(m => m.MainAsignaturasProfesorComponent)
  },

  // COMITÉ CURRICULAR
  { path: 'comite', component: ComiteHome, canActivate: [AuthGuard] },
  {
    path: 'comite/ra',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./modules/competencia-ra/ra-main/ra-main.component')
        .then(m => m.MainRaComponent)
  }
];
