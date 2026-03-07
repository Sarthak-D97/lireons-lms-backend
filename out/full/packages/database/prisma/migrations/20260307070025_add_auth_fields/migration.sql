-- CreateTable
CREATE TABLE "lireons_admins" (
    "admin_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SUPPORT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lireons_admins_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "sales_leads" (
    "lead_id" TEXT NOT NULL,
    "admin_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "academy_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sales_leads_pkey" PRIMARY KEY ("lead_id")
);

-- CreateTable
CREATE TABLE "saas_plans" (
    "plan_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "billing_cycle" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "max_students_allowed" INTEGER NOT NULL,
    "max_storage_gb" INTEGER NOT NULL,
    "has_white_label_app" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "saas_plans_pkey" PRIMARY KEY ("plan_id")
);

-- CreateTable
CREATE TABLE "tenant_owners" (
    "owner_id" TEXT NOT NULL,
    "lead_id" TEXT,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone" TEXT,
    "billing_address" TEXT,
    "tax_id" TEXT,
    "stripe_customer_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_owners_pkey" PRIMARY KEY ("owner_id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "sub_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TRIAL',
    "trial_ends_at" TIMESTAMP(3),
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("sub_id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "invoice_id" TEXT NOT NULL,
    "sub_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "tax_amount" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "pdf_url" TEXT,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("invoice_id")
);

-- CreateTable
CREATE TABLE "saas_payment_transactions" (
    "transaction_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "gateway" TEXT NOT NULL DEFAULT 'STRIPE',
    "gateway_payment_id" TEXT,
    "amount_paid" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saas_payment_transactions_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "tenant_organizations" (
    "org_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "org_name" TEXT NOT NULL,
    "org_type" TEXT NOT NULL DEFAULT 'ACADEMY',
    "subdomain" TEXT NOT NULL,
    "custom_domain" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "db_routing_key" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenant_organizations_pkey" PRIMARY KEY ("org_id")
);

-- CreateTable
CREATE TABLE "organization_settings" (
    "settings_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "service_name" TEXT NOT NULL,
    "org_logo_url" TEXT,
    "primary_color" TEXT,
    "secondary_color" TEXT,
    "font_family" TEXT,
    "font_size" TEXT,

    CONSTRAINT "organization_settings_pkey" PRIMARY KEY ("settings_id")
);

-- CreateTable
CREATE TABLE "organization_designs" (
    "design_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "landing_page_layout" TEXT NOT NULL,
    "design_theme" TEXT NOT NULL,
    "custom_css" JSONB,

    CONSTRAINT "organization_designs_pkey" PRIMARY KEY ("design_id")
);

-- CreateTable
CREATE TABLE "organization_app_settings" (
    "app_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "app_name" TEXT NOT NULL,
    "package_name" TEXT NOT NULL,
    "app_icon_url" TEXT,
    "app_status" TEXT NOT NULL DEFAULT 'BUILDING',
    "allow_offline_download" BOOLEAN NOT NULL DEFAULT false,
    "max_devices_per_user" INTEGER NOT NULL DEFAULT 2,

    CONSTRAINT "organization_app_settings_pkey" PRIMARY KEY ("app_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "ph_no" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT NOT NULL DEFAULT 'credentials',
    "otp" TEXT,
    "otp_expiry" TIMESTAMP(3),
    "lead_source" TEXT,
    "githubId" TEXT,
    "googleId" TEXT,
    "linkedinId" TEXT,
    "is_alumni" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_devices" (
    "device_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_type" TEXT NOT NULL,
    "os_version" TEXT,
    "fcm_token" TEXT,
    "last_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_devices_pkey" PRIMARY KEY ("device_id")
);

-- CreateTable
CREATE TABLE "roles" (
    "role_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "keystores" (
    "_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "primaryKey" TEXT NOT NULL,
    "secondaryKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "keystores_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "content_drafts" (
    "draft_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "educator_id" TEXT NOT NULL,
    "target_entity" TEXT NOT NULL,
    "target_id" TEXT,
    "draft_payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "last_modified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_drafts_pkey" PRIMARY KEY ("draft_id")
);

-- CreateTable
CREATE TABLE "media_library" (
    "media_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "uploader_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "cloud_url" TEXT NOT NULL,
    "transcoding_status" TEXT NOT NULL DEFAULT 'READY',
    "file_size_kb" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_library_pkey" PRIMARY KEY ("media_id")
);

-- CreateTable
CREATE TABLE "analytics_aggregations" (
    "agg_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "aggregation_date" DATE NOT NULL,
    "total_sales" INTEGER NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "active_students" INTEGER NOT NULL DEFAULT 0,
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_aggregations_pkey" PRIMARY KEY ("agg_id")
);

-- CreateTable
CREATE TABLE "products" (
    "product_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "cover_image_url" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "discount_price" DECIMAL(10,2),
    "is_free" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "creator_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "product_subjects" (
    "_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "cover_image_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_subjects_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "product_topics" (
    "_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "order_index" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_topics_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "materials" (
    "_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "media_id" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "content_url" TEXT,
    "is_preview" BOOLEAN NOT NULL DEFAULT false,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "scheduled_at" TIMESTAMP(3),

    CONSTRAINT "materials_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "metadata" (
    "_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT[],
    "extra_details" JSONB,

    CONSTRAINT "metadata_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "core_test_cases" (
    "_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "input_data" TEXT NOT NULL,
    "expected_output" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "core_test_cases_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "code_submissions" (
    "_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "output" TEXT,
    "execution_time" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "code_submissions_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "attempt_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "time_taken_seconds" INTEGER NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("attempt_id")
);

-- CreateTable
CREATE TABLE "community_posts" (
    "post_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("post_id")
);

-- CreateTable
CREATE TABLE "community_comments" (
    "comment_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,

    CONSTRAINT "community_comments_pkey" PRIMARY KEY ("comment_id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "messages" (
    "_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SENT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "material_progress" (
    "progress_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "watch_time_seconds" INTEGER NOT NULL DEFAULT 0,
    "last_accessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "material_progress_pkey" PRIMARY KEY ("progress_id")
);

-- CreateTable
CREATE TABLE "coupons" (
    "coupon_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discount_type" TEXT NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "usage_limit" INTEGER NOT NULL,

    CONSTRAINT "coupons_pkey" PRIMARY KEY ("coupon_id")
);

-- CreateTable
CREATE TABLE "affiliate_links" (
    "link_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "affiliate_user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "referral_code" TEXT NOT NULL,
    "commission_percentage" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "affiliate_links_pkey" PRIMARY KEY ("link_id")
);

-- CreateTable
CREATE TABLE "enrollments" (
    "enrollment_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "enrolled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "progress_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("enrollment_id")
);

-- CreateTable
CREATE TABLE "student_payments" (
    "payment_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "coupon_id" TEXT,
    "affiliate_link_id" TEXT,
    "gateway_payment_id" TEXT,
    "payment_gateway" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "amount" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL,
    "order_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "client" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("_id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "log_id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "user_id" TEXT,
    "event_type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lireons_admins_email_key" ON "lireons_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_owners_lead_id_key" ON "tenant_owners"("lead_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_owners_email_key" ON "tenant_owners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_owners_stripe_customer_id_key" ON "tenant_owners"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_tenant_id_key" ON "subscriptions"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "saas_payment_transactions_invoice_id_key" ON "saas_payment_transactions"("invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_organizations_subdomain_key" ON "tenant_organizations"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_organizations_custom_domain_key" ON "tenant_organizations"("custom_domain");

-- CreateIndex
CREATE INDEX "tenant_organizations_owner_id_idx" ON "tenant_organizations"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_settings_org_id_key" ON "organization_settings"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_designs_org_id_key" ON "organization_designs"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_app_settings_org_id_key" ON "organization_app_settings"("org_id");

-- CreateIndex
CREATE INDEX "users_org_id_status_idx" ON "users"("org_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "users_org_id_email_key" ON "users"("org_id", "email");

-- CreateIndex
CREATE INDEX "user_devices_org_id_user_id_idx" ON "user_devices"("org_id", "user_id");

-- CreateIndex
CREATE INDEX "keystores_org_id_client_idx" ON "keystores"("org_id", "client");

-- CreateIndex
CREATE INDEX "content_drafts_org_id_educator_id_idx" ON "content_drafts"("org_id", "educator_id");

-- CreateIndex
CREATE INDEX "media_library_org_id_uploader_id_idx" ON "media_library"("org_id", "uploader_id");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_aggregations_org_id_entity_type_entity_id_aggrega_key" ON "analytics_aggregations"("org_id", "entity_type", "entity_id", "aggregation_date");

-- CreateIndex
CREATE INDEX "products_org_id_status_idx" ON "products"("org_id", "status");

-- CreateIndex
CREATE INDEX "product_subjects_org_id_product_id_idx" ON "product_subjects"("org_id", "product_id");

-- CreateIndex
CREATE INDEX "product_topics_org_id_product_id_idx" ON "product_topics"("org_id", "product_id");

-- CreateIndex
CREATE INDEX "materials_org_id_product_id_order_index_idx" ON "materials"("org_id", "product_id", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "metadata_material_id_key" ON "metadata"("material_id");

-- CreateIndex
CREATE INDEX "code_submissions_org_id_user_id_material_id_idx" ON "code_submissions"("org_id", "user_id", "material_id");

-- CreateIndex
CREATE INDEX "quiz_attempts_org_id_user_id_material_id_idx" ON "quiz_attempts"("org_id", "user_id", "material_id");

-- CreateIndex
CREATE INDEX "community_posts_org_id_created_at_idx" ON "community_posts"("org_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "community_comments_org_id_post_id_idx" ON "community_comments"("org_id", "post_id");

-- CreateIndex
CREATE INDEX "bookmarks_org_id_user_id_idx" ON "bookmarks"("org_id", "user_id");

-- CreateIndex
CREATE INDEX "messages_org_id_sender_id_receiver_id_idx" ON "messages"("org_id", "sender_id", "receiver_id");

-- CreateIndex
CREATE INDEX "material_progress_org_id_user_id_idx" ON "material_progress"("org_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "material_progress_user_id_material_id_key" ON "material_progress"("user_id", "material_id");

-- CreateIndex
CREATE UNIQUE INDEX "coupons_org_id_code_key" ON "coupons"("org_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_links_referral_code_key" ON "affiliate_links"("referral_code");

-- CreateIndex
CREATE INDEX "affiliate_links_org_id_affiliate_user_id_idx" ON "affiliate_links"("org_id", "affiliate_user_id");

-- CreateIndex
CREATE INDEX "enrollments_org_id_user_id_status_idx" ON "enrollments"("org_id", "user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_user_id_product_id_key" ON "enrollments"("user_id", "product_id");

-- CreateIndex
CREATE INDEX "student_payments_org_id_status_created_at_idx" ON "student_payments"("org_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_org_id_idx" ON "api_keys"("org_id");

-- CreateIndex
CREATE INDEX "system_logs_org_id_created_at_idx" ON "system_logs"("org_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "sales_leads" ADD CONSTRAINT "sales_leads_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "lireons_admins"("admin_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_owners" ADD CONSTRAINT "tenant_owners_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "sales_leads"("lead_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant_organizations"("org_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "saas_plans"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_sub_id_fkey" FOREIGN KEY ("sub_id") REFERENCES "subscriptions"("sub_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "tenant_owners"("owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saas_payment_transactions" ADD CONSTRAINT "saas_payment_transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("invoice_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_organizations" ADD CONSTRAINT "tenant_organizations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "tenant_owners"("owner_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_settings" ADD CONSTRAINT "organization_settings_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_designs" ADD CONSTRAINT "organization_designs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_app_settings" ADD CONSTRAINT "organization_app_settings_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keystores" ADD CONSTRAINT "keystores_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keystores" ADD CONSTRAINT "keystores_client_fkey" FOREIGN KEY ("client") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_drafts" ADD CONSTRAINT "content_drafts_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_drafts" ADD CONSTRAINT "content_drafts_educator_id_fkey" FOREIGN KEY ("educator_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_library" ADD CONSTRAINT "media_library_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_library" ADD CONSTRAINT "media_library_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_aggregations" ADD CONSTRAINT "analytics_aggregations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_subjects" ADD CONSTRAINT "product_subjects_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_subjects" ADD CONSTRAINT "product_subjects_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_topics" ADD CONSTRAINT "product_topics_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_topics" ADD CONSTRAINT "product_topics_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_topics" ADD CONSTRAINT "product_topics_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "product_subjects"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "product_topics"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "materials" ADD CONSTRAINT "materials_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media_library"("media_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "metadata" ADD CONSTRAINT "metadata_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "core_test_cases" ADD CONSTRAINT "core_test_cases_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_submissions" ADD CONSTRAINT "code_submissions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_submissions" ADD CONSTRAINT "code_submissions_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_submissions" ADD CONSTRAINT "code_submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "community_posts"("post_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_comments" ADD CONSTRAINT "community_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_progress" ADD CONSTRAINT "material_progress_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_progress" ADD CONSTRAINT "material_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_progress" ADD CONSTRAINT "material_progress_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_progress" ADD CONSTRAINT "material_progress_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("enrollment_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_links" ADD CONSTRAINT "affiliate_links_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_links" ADD CONSTRAINT "affiliate_links_affiliate_user_id_fkey" FOREIGN KEY ("affiliate_user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_links" ADD CONSTRAINT "affiliate_links_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_payments" ADD CONSTRAINT "student_payments_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_payments" ADD CONSTRAINT "student_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_payments" ADD CONSTRAINT "student_payments_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("enrollment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_payments" ADD CONSTRAINT "student_payments_coupon_id_fkey" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("coupon_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_payments" ADD CONSTRAINT "student_payments_affiliate_link_id_fkey" FOREIGN KEY ("affiliate_link_id") REFERENCES "affiliate_links"("link_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "tenant_organizations"("org_id") ON DELETE CASCADE ON UPDATE CASCADE;
