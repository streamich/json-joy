export interface DocResource {
  title: string;
  serviceId: string;
  identifier: string;
  intro?: string;
  description?: string;
  type: Json;
  examples?: DocResourceExample[];
  children?: DocResource[];
  parent?: string;
}

export interface DocResourceExample {
  title?: string;
  description?: string;
  value: unknown;
}
