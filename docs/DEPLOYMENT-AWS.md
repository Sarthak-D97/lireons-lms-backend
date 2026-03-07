# Deployment: AWS ECS (Fargate)

Backend deployment guide for **lireons-academy-api**, **lireons-control-plane-api**, and **lireons-media-worker** on AWS ECS with Fargate.

---

## 1. Infrastructure Overview

| Component | Purpose |
|-----------|---------|
| **VPC** | Public + Private subnets |
| **Neon DB** | Serverless Postgres (no RDS) – connect via `DATABASE_URL` |
| **ElastiCache Redis** | BullMQ, cache – in private subnet |
| **S3** | Media storage (worker uploads) |
| **ALB** | Routes `api.lireons.com` → academy-api, `api.lireons.com/internal` → control-plane-api |
| **ECS Fargate** | Runs containers in private subnet |

---

## 2. Build Images (Turbo Prune)

Each app uses a **turbo prune** Dockerfile so only its dependencies are built.

```bash
# Build all three images
./scripts/docker-build.sh all

# Or build individually
./scripts/docker-build.sh academy-api
./scripts/docker-build.sh control-plane-api
./scripts/docker-build.sh media-worker
```

**Tag for ECR:**
```bash
export AWS_ACCOUNT_ID=123456789012
export AWS_REGION=ap-south-1
./scripts/docker-build.sh all
```

---

## 3. Push to Amazon ECR

```bash
# Login
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com

# Create repos (one-time)
aws ecr create-repository --repository-name lireons-academy-api
aws ecr create-repository --repository-name lireons-control-plane-api
aws ecr create-repository --repository-name lireons-media-worker

# Push
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/lireons-academy-api:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/lireons-control-plane-api:latest
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/lireons-media-worker:latest
```

---

## 4. Environment Variables (ECS Task Definitions)

### academy-api
| Variable | Source |
|----------|--------|
| `DATABASE_URL` | Neon connection string |
| `REDIS_URL` | ElastiCache endpoint |
| `ACADEMY_API_PORT` | `4002` |
| `NODE_ENV` | `production` |

### control-plane-api
| Variable | Source |
|----------|--------|
| `DATABASE_URL` | Neon connection string |
| `REDIS_URL` | ElastiCache endpoint |
| `CONTROL_PLANE_PORT` | `4001` |
| `NODE_ENV` | `production` |

### media-worker
| Variable | Source |
|----------|--------|
| `DATABASE_URL` | Neon connection string |
| `REDIS_URL` | ElastiCache endpoint |
| `AWS_ACCESS_KEY_ID` | IAM role or secrets |
| `AWS_SECRET_ACCESS_KEY` | IAM role or secrets |
| `AWS_REGION` | e.g. `ap-south-1` |
| `S3_BUCKET` | Media bucket name |
| `NODE_ENV` | `production` |

> **Note:** Use AWS Secrets Manager or Parameter Store for sensitive values; reference them in the ECS task definition.

---

## 5. ECS Service Layout

| Service | Subnet | ALB | Auto-scaling |
|---------|--------|-----|--------------|
| **academy-api** | Private | ✅ Target group (e.g. `/api/*`) | CPU 70% |
| **control-plane-api** | Private | ✅ Target group (e.g. `/internal/*`) | CPU 70% |
| **media-worker** | Private | ❌ No ALB | Scale by queue depth |

---

## 6. ALB Routing

- `api.lireons.com` → academy-api (port 4002)
- `api.lireons.com/internal` → control-plane-api (port 4001)
- media-worker: no ALB; only Redis + S3 access

---

## 7. Security

- Run tasks as non-root user (`nestjs`, uid 1001)
- Use private subnets for tasks
- ElastiCache in private subnet
- IAM roles for S3 (worker) and ECR pull
- VPC security groups: only ALB → tasks, tasks → Redis/Neon
