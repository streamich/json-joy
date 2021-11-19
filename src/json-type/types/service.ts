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
  // methods: DocMethod[];
  // resources: DocResource[];
}
