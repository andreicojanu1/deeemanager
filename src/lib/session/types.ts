export type Rol = 'COLECTOR' | 'ADMIN';
export type StatusCont = 'ACTIV' | 'NEACTIVAT';

export type Session = {
  utilizator: { id: string; nume: string; email: string; initiale: string };
  organizatie: { id: string; denumire: string; eticheta: string };
  rol: Rol;
  statusCont: StatusCont;
};
