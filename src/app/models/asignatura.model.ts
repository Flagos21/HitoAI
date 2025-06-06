export interface Asignatura {
  ID_Asignatura: string;
  Nombre: string;
  Semestre: string;
  N_Hito: number;
  Plan_Academico: string;
  carrera_ID_Carrera: number;
  usuario_ID_Usuario: string;
  Carrera?: string;
  Profesor?: string;
}
