export interface CreateTenantBody {
  orgName: string;
  orgType?: string;
  subdomain: string;
  customDomain?: string;
  status?: string;
  dbRoutingKey?: string;
}

export interface CreateTenantWithOwner extends CreateTenantBody {
  ownerId: string;
}

export type UpdateTenantBody = Partial<CreateTenantBody>;