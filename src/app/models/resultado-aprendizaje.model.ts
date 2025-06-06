export interface ResultadoAprendizaje {
  ID_RA?: string;
  Nombre: string;
  Descripcion: string;
  asignatura_ID_Asignatura: string;
  competencias?: string; // IDs concatenated
}
