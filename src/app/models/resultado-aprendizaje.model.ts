export interface ResultadoAprendizaje {
  ID_RA?: number;
  Nombre: string;
  Descripcion: string;
  asignatura_ID_Asignatura: string;
  competencias?: string; // IDs concatenated
}
