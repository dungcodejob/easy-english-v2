export class Tenant {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;

  constructor(partial: Partial<Tenant>) {
    Object.assign(this, partial);
  }
}
