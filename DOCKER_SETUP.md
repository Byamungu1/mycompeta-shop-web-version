# Docker Setup for GitHub Actions with Docker Hub

This setup enables automated building and pushing of Docker images to a Docker Hub private repository using GitHub Actions with Docker Compose integration.

## Prerequisites

1. **Docker Hub Account**: Create an account at [hub.docker.com](https://hub.docker.com)
2. **Private Repository**: Create a private repository on Docker Hub (e.g., `competa-shop-web`)
3. **GitHub Repository**: Ensure your code is hosted on GitHub

## Setup Instructions

### 1. GitHub Secrets Configuration

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

**Docker Hub Credentials:**
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub access token (recommended) or password
- `DOCKER_REPOSITORY`: Your Docker Hub repository name (e.g., `competa-shop-web`)

**Application Secrets:**
- `VITE_API_URL`: API endpoint URL (e.g., `/api/`)
- `VITE_CART_STORAGE_KEY`: Cart storage key (default: `user_shopping_cart`)
- `VITE_DIRECT_BUY_STORAGE_KEY`: Direct buy storage key (default: `directBuyProduct`)
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID (optional)
- `VITE_GOOGLE_REDIRECT_URL`: Google OAuth redirect URL (optional)

**Deployment Secrets (optional, for SSH deployment):**
- `SSH_HOST`: Your server hostname/IP
- `SSH_USER`: SSH username
- `SSH_PRIVATE_KEY`: SSH private key for authentication

#### Creating a Docker Hub Access Token:
1. Go to [Docker Hub Account Settings](https://hub.docker.com/settings/security)
2. Click "New Access Token"
3. Give it a descriptive name (e.g., "github-actions")
4. Select "Read & Write" access
5. Copy the generated token and add it as `DOCKER_PASSWORD` in GitHub secrets

### 2. Environment Variables (Optional)

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the values according to your configuration:

```env
DOCKER_USERNAME=your-dockerhub-username
DOCKER_REPOSITORY=competa-shop-web
IMAGE_TAG=latest
NODE_ENV=production
VITE_API_URL=/api/
VITE_CART_STORAGE_KEY=user_shopping_cart
VITE_DIRECT_BUY_STORAGE_KEY=directBuyProduct
```

### 3. Workflow Configuration

The GitHub Actions workflow (`.github/workflows/docker-build-push.yml`) is configured to:

- **Trigger on**: Push to `main` or `develop` branches, pull requests, or manual workflow dispatch
- **Build & Push**: Multi-stage Docker build optimized for production, pushes to Docker Hub
- **Docker Compose Test**: Tests the built image using docker-compose
- **Deploy**: Optional SSH deployment to your server (only on main branch)
- **Tags**: Automatically tags images with branch name, commit SHA, and `latest` for main branch

### 4. Local Testing

Test the Docker setup locally before pushing:

```bash
# Build the image locally using docker-compose
docker-compose build

# Or pull from Docker Hub (if image exists)
docker-compose pull

# Run the container
docker-compose up -d

# Access the application
open http://localhost:3000

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

**Note**: Use `docker-compose` (with hyphen) for compatibility with the GitHub Actions workflow. If you have Docker Compose V2, you can also use `docker compose` (without hyphen).

### 5. Deployment Workflow

When you push to the configured branches:

1. GitHub Actions triggers automatically
2. Code is checked out
3. Docker image is built using the Dockerfile
4. Image is pushed to Docker Hub with appropriate tags
5. Docker Compose test runs to verify the image
6. (Optional) SSH deployment to your server if configured
7. You can pull and deploy the image on your server

## Docker Compose Services

### Web Service
- **Image**: Pulls from Docker Hub (`${DOCKER_USERNAME}/${DOCKER_REPOSITORY}:${IMAGE_TAG}`)
- **Build**: Can also build locally using the Dockerfile
- **Ports**: `3000:80`
- **Environment**: Production configuration with environment variables
- **Restart**: Automatically restarts unless stopped
- **Network**: Custom bridge network for isolation

## Deployment to Production

### Pull and Run on Server

```bash
# Login to Docker Hub
docker login

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Option 1: Pull the latest image using docker-compose
docker-compose pull
docker-compose up -d

# Option 2: Build locally using docker-compose
docker-compose build
docker-compose up -d

# Option 3: Run directly with docker
docker run -d -p 3000:80 --name competa-shop-web yourusername/competa-shop-web:latest
```

**Note**: Use `docker-compose` commands for consistency with the GitHub Actions workflow.

### Using Specific Tags

```bash
# Update IMAGE_TAG in .env file
echo "IMAGE_TAG=main-abc1234" >> .env

# Pull specific tag
docker-compose pull

# Restart with new tag
docker-compose up -d
```

**Note**: Ensure you use `docker-compose` commands to match the GitHub Actions workflow configuration.

## Troubleshooting

### Authentication Issues
- Verify Docker Hub credentials in GitHub secrets (`DOCKER_USERNAME`, `DOCKER_PASSWORD`)
- Ensure access token has "Read & Write" permissions
- Check that `DOCKER_REPOSITORY` matches your Docker Hub repository name
- Verify the repository is private on Docker Hub

### Build Failures
- Check the Actions tab in GitHub for detailed logs
- Ensure the Dockerfile syntax is correct
- Verify all dependencies are properly installed
- Check that the nginx configuration file exists

### Docker Compose Issues
- Verify `.env` file exists with correct variables
- Ensure Docker is running and accessible
- Check that the image tag exists in Docker Hub
- Verify port 3000 is not already in use
- Ensure you're using `docker-compose` (with hyphen) for compatibility

### Runtime Issues
- Check nginx configuration in `nginx.conf`
- Verify environment variables are set correctly in `.env`
- Ensure API proxy target is accessible
- Check container logs: `docker-compose logs -f`

### Docker Compose Version Compatibility
- The workflow uses `docker-compose` (with hyphen) for broader compatibility
- If you have Docker Compose V2, you can use `docker compose` (without hyphen) locally
- GitHub Actions runners support both versions

## Customization

### Modify Workflow Triggers
Edit `.github/workflows/docker-build-push.yml` to change trigger conditions:

```yaml
on:
  push:
    branches:
      - main          # Add/remove branches
      - staging
      - production
```

### Change Docker Hub Repository
Update the `DOCKER_REPOSITORY` secret in GitHub repository settings, or modify the workflow:

```yaml
env:
  IMAGE_NAME: ${{ secrets.DOCKER_USERNAME }}/${{ secrets.DOCKER_REPOSITORY }}
```

### Add Build Arguments
Modify the Docker build step to include custom build arguments:

```yaml
- name: Build and push Docker image
  uses: docker/build-push-action@v5
  with:
    build-args: |
      NODE_ENV=production
      CUSTOM_ARG=value
```

### Configure SSH Deployment
To enable automatic SSH deployment, add these secrets to your GitHub repository:
- `SSH_HOST`: Your server hostname/IP
- `SSH_USER`: SSH username  
- `SSH_PRIVATE_KEY`: SSH private key

Update the deployment script path in the workflow:
```yaml
script: |
  cd /path/to/your/app  # Change this to your app directory
```

## Security Best Practices

1. **Use Access Tokens**: Never use your Docker Hub password directly
2. **Private Repository**: Keep your repository private on Docker Hub
3. **Secrets Management**: Use GitHub Secrets for sensitive data
4. **Regular Updates**: Keep base images and dependencies updated
5. **Scan Images**: Enable Docker Hub security scanning

## Maintenance

### Update Base Images
```bash
docker pull nginx:alpine
docker pull node:18-alpine
```

### Clean Up Old Images
```bash
# Remove unused images
docker image prune -a

# Remove build cache
docker builder prune
```

## Support

For issues related to:
- **GitHub Actions**: Check [GitHub Actions Documentation](https://docs.github.com/en/actions)
- **Docker Hub**: Visit [Docker Hub Support](https://docs.docker.com/docker-hub/)
- **Docker Compose**: See [Docker Compose Docs](https://docs.docker.com/compose/)