#!/bin/bash

# Stop the script if any command fails
set -e

# ==========================================
# CONFIGURATION
# ==========================================
AWS_ACCOUNT_ID="147237731802"
AWS_REGION="ap-south-1"

# ==========================================
# 1. AUTHENTICATE WITH AWS ECR
# ==========================================
echo "🔐 Authenticating Docker with AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
echo "✅ Authentication successful!"
echo ""

# ==========================================
# 2. PUSH FUNCTION
# ==========================================
push_image() {
  local APP_NAME=$1
  local IMAGE_NAME="lireons-$APP_NAME"
  local LOCAL_IMAGE="$IMAGE_NAME:latest"
  local ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$IMAGE_NAME:latest"

  echo "---------------------------------------------------"
  echo "🚀 Processing local image: $LOCAL_IMAGE"
  echo "---------------------------------------------------"

  # Verify the local image actually exists before trying to push
  if ! docker image inspect $LOCAL_IMAGE > /dev/null 2>&1; then
    echo "❌ Error: Local image '$LOCAL_IMAGE' not found! Skipping..."
    echo ""
    return
  fi

  # Check if ECR repository exists, create it if it doesn't
  echo "📁 Checking AWS ECR repository..."
  if ! aws ecr describe-repositories --repository-names $IMAGE_NAME --region $AWS_REGION > /dev/null 2>&1; then
      echo "   Creating new repository: $IMAGE_NAME..."
      aws ecr create-repository --repository-name $IMAGE_NAME --region $AWS_REGION > /dev/null
  fi
  echo "✅ Repository ready."

  # Tag the image for AWS
  echo "🏷️  Tagging image..."
  docker tag $LOCAL_IMAGE $ECR_URI

  # Push to AWS
  echo "☁️  Pushing image to AWS ECR..."
  docker push $ECR_URI

  echo "✅ Successfully pushed $IMAGE_NAME to AWS!"
  echo ""
}

# ==========================================
# 3. EXECUTE PUSHES
# ==========================================
# Uncomment the apps you have built locally and want to push!

push_image "academy-api"
push_image "control-plane-api"
push_image "media-worker"
push_image "code-runner-worker"
push_image "main"

echo "🎉 All selected local images have been deployed to AWS ECR!"