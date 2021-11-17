export interface DocProduct {
  id: string;
  name: string;
  title: string;
  intro?: string;
  description: string;
  slug: string;
  services: DocService[];
  isSubproduct?: boolean;
}

export interface DocService {
  id: string;
  name: string;
  intro?: string;
  description: string;
  slug: string;
  methods: DocMethod[];
  resources: DocResource[];
}

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
