#!/usr/bin/env bash
# Build all backend images for AWS ECR deployment
# Usage: ./scripts/docker-build.sh [academy-api|control-plane-api|media-worker|lireons-main|code-runner-worker|all]

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

AWS_ACCOUNT_ID="${AWS_ACCOUNT_ID:-}"
AWS_REGION="${AWS_REGION:-ap-south-1}"
ECR_PREFIX="${ECR_PREFIX:-lireons}"

build() {
  local app=$1
  local dockerfile=$2
  local tag="${ECR_PREFIX}-${app}"
  echo "Building $tag..."
  docker build -f "$dockerfile" -t "$tag:latest" .
  if [[ -n "$AWS_ACCOUNT_ID" ]]; then
    local ecr_uri="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${tag}"
    docker tag "$tag:latest" "$ecr_uri:latest"
    echo "Tagged for ECR: $ecr_uri:latest"
  fi
}

case "${1:-all}" in
  academy-api)
    build academy-api Dockerfile.academy-api
    ;;
  control-plane-api)
    build control-plane-api Dockerfile.control-plane-api
    ;;
  media-worker)
    build media-worker Dockerfile.media-worker
    ;;
  lireons-main)
    build lireons-main Dockerfile.lireons-main
    ;;
  code-runner-worker)
    build code-runner-worker Dockerfile.code-runner-worker
    ;;
  all)
    build academy-api Dockerfile.academy-api
    build control-plane-api Dockerfile.control-plane-api
    build media-worker Dockerfile.media-worker
    build lireons-main Dockerfile.lireons-main
    build code-runner-worker Dockerfile.code-runner-worker
    ;;
  *)
    echo "Usage: $0 [academy-api|control-plane-api|media-worker|lireons-main|code-runner-worker|all]"
    exit 1
    ;;
esac

echo "Done."
