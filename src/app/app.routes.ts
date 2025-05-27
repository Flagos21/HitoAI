import { Routes } from '@angular/router';
import { HomeComponent as AdminHome } from './modules/admin/home/home.component';
import { HomeComponent as JefeHome } from './modules/jefe-carrera/home/home.component';
import { HomeComponent as ProfesorHome } from './modules/profesor/home/home.component';
import { HomeComponent as ComiteHome } from './modules/comite/home/home.component';
import { LoginComponent } from './modules/login/login.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // ADMIN
  { path: 'admin', component: AdminHome },
  {
    path: 'admin/carreras',
    loadComponent: () =>
      import('./modules/admin/carreras/main-carreras/main-carreras.component')
        .then(m => m.MainCarrerasComponent)
  },
  {
    path: 'admin/asignaturas',
    loadComponent: () =>
      import('./modules/admin/asignaturas/main-asignaturas/main-asignaturas.component')
        .then(m => m.MainAsignaturasComponent)
  },

  // JEFE DE CARRERA
  { path: 'jefe-carrera', component: JefeHome },
  {
    path: 'jefe-carrera/asignaturas',
    loadComponent: () =>
      import('./modules/rubricas/main-asignaturas-jefe/main-asignaturas-jefe.component')
        .then(m => m.MainAsignaturasJefeComponent)
  },
  {
    path: 'jefe-carrera/ra',
    loadComponent: () =>
      import('./modules/competencia-ra/ra-main/ra-main.component')
        .then(m => m.MainRaComponent)
  },

  // PROFESOR
  { path: 'profesor', component: ProfesorHome },
  {
    path: 'profesor/asignaturas',
    loadComponent: () =>
      import('./modules/rubricas/main-asignaturas-profesor/main-asignaturas-profesor.component')
        .then(m => m.MainAsignaturasProfesorComponent)
  },

  // COMITÉ CURRICULAR
  { path: 'comite', component: ComiteHome },
  {
    path: 'comite/ra',
    loadComponent: () =>
      import('./modules/competencia-ra/ra-main/ra-main.component')
        .then(m => m.MainRaComponent)
  }
];
