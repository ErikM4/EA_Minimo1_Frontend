// Valores permitidos para clasificar y mostrar una actividad.
export type ActivityCategory = 'SPORT' | 'LEISURE';
export type ActivitySubcategory = 'BASKETBALL' | 'RUNNING' | 'ARCADE' | 'TCG_BOARDGAMES';
export type ActivityModality = 'CASUAL' | 'ORGANIZED';
export type ActivityStatus = 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED';

// Datos de una actividad tal como los devuelve la API.
export interface Activity {
  _id: string;
  creatorId?: string | { _id: string; name?: string; email?: string };
  title: string;
  description: string;
  category: ActivityCategory;
  subcategory: ActivitySubcategory;
  modality: ActivityModality;
  status: ActivityStatus;
  location: {
    type: 'Point';
    coordinates: [number, number];
    addressName: string;
    isStoreLocation: boolean;
  };
  route?: {
    distanceKm?: number;
    paceTarget?: string;
  } | null;
  schedule: {
    startTime: string;
    endTime: string;
  };
  capacity: {
    minParticipants: number;
    maxParticipants: number;
  };
  participants?: {
    userId: string;
    name: string;
    avatarUrl?: string;
    joinedAt?: string;
  }[];
  pricing: {
    price: number;
    prizeInfo?: string;
  };
  deleted: boolean;
  deletedAt?: string | null;
  createdAt?: string;
}

// Campos que el formulario puede enviar al crear o editar una actividad.
export type ActivityInput = Omit<
  Activity,
  '_id' | 'deleted' | 'deletedAt' | 'createdAt' | 'participants'
> & {
  participants?: Activity['participants'];
};
