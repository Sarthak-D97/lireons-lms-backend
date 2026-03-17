export interface CreateTenantBody {
  orgName: string;
  orgType?: string;
  subdomain: string;
  customDomain?: string;
  planId?: string;
  status?: string;
  dbRoutingKey?: string;
  phone?: string;
  billingAddress?: string;
  taxId?: string;
}

export interface CreateTenantWithOwner extends CreateTenantBody {
  ownerId: string;
}

export type UpdateTenantBody = Partial<CreateTenantBody>;