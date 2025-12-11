#!/bin/bash

###############################################################################
# Alkana Coating - Zero Downtime Deployment (Blue-Green Strategy)
# Usage: ./zero-downtime-deploy.sh
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration (modify these for your hosting)
DEPLOY_USER="your_ssh_user"
DEPLOY_HOST="your_server_ip"
DEPLOY_PATH="/var/www/alkana-coating"
BACKUP_DIR="$DEPLOY_PATH/backups"
RELEASES_DIR="$DEPLOY_PATH/releases"
SHARED_DIR="$DEPLOY_PATH/shared"
CURRENT_LINK="$DEPLOY_PATH/current"
KEEP_RELEASES=5

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RELEASE_DIR="$RELEASES_DIR/$TIMESTAMP"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Zero-Downtime Deployment${NC}"
echo -e "${BLUE}========================================${NC}"

# Function to execute remote commands
remote_exec() {
    ssh "$DEPLOY_USER@$DEPLOY_HOST" "$@"
}

# Function to copy files to remote
remote_copy() {
    rsync -avz --delete "$1" "$DEPLOY_USER@$DEPLOY_HOST:$2"
}

# Step 1: Build locally
echo -e "${YELLOW}▶ Step 1: Building locally...${NC}"
bash scripts/deploy-advanced.sh production "$TIMESTAMP"
echo -e "${GREEN}✓ Local build complete${NC}"

# Step 2: Create directories on server
echo -e "${YELLOW}▶ Step 2: Preparing server directories...${NC}"
remote_exec "mkdir -p $RELEASES_DIR $SHARED_DIR $BACKUP_DIR"
remote_exec "mkdir -p $SHARED_DIR/storage $SHARED_DIR/uploads"
echo -e "${GREEN}✓ Server directories ready${NC}"

# Step 3: Upload new release
echo -e "${YELLOW}▶ Step 3: Uploading new release...${NC}"
remote_exec "mkdir -p $RELEASE_DIR"

# Extract and upload build
unzip -q "alkana-coating-$TIMESTAMP.zip" -d "temp-deploy"
remote_copy "temp-deploy/" "$RELEASE_DIR/"
rm -rf "temp-deploy"

echo -e "${GREEN}✓ New release uploaded${NC}"

# Step 4: Link shared directories
echo -e "${YELLOW}▶ Step 4: Linking shared directories...${NC}"
remote_exec "
    # Backend storage
    rm -rf $RELEASE_DIR/backend/storage
    ln -nfs $SHARED_DIR/storage $RELEASE_DIR/backend/storage
    
    # Backend uploads
    rm -rf $RELEASE_DIR/backend/public/uploads
    ln -nfs $SHARED_DIR/uploads $RELEASE_DIR/backend/public/uploads
    
    # Environment file
    ln -nfs $SHARED_DIR/.env $RELEASE_DIR/backend/.env
"
echo -e "${GREEN}✓ Shared directories linked${NC}"

# Step 5: Run migrations (test first)
echo -e "${YELLOW}▶ Step 5: Testing database migrations...${NC}"
remote_exec "
    cd $RELEASE_DIR/backend
    php artisan migrate:status
    php artisan migrate --force --pretend
"

read -p "Proceed with actual migrations? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    remote_exec "
        cd $RELEASE_DIR/backend
        php artisan migrate --force
    "
    echo -e "${GREEN}✓ Migrations complete${NC}"
else
    echo -e "${RED}✗ Deployment cancelled${NC}"
    exit 1
fi

# Step 6: Optimize application
echo -e "${YELLOW}▶ Step 6: Optimizing application...${NC}"
remote_exec "
    cd $RELEASE_DIR/backend
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan optimize
"
echo -e "${GREEN}✓ Application optimized${NC}"

# Step 7: Health check on new release
echo -e "${YELLOW}▶ Step 7: Running health check...${NC}"
HEALTH_CHECK=$(remote_exec "cd $RELEASE_DIR/backend && php artisan tinker --execute=\"echo 'OK';\"" 2>&1)
if [[ $HEALTH_CHECK == *"OK"* ]]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
    echo -e "${RED}Rolling back...${NC}"
    remote_exec "rm -rf $RELEASE_DIR"
    exit 1
fi

# Step 8: Backup current version
if remote_exec "[ -L $CURRENT_LINK ]"; then
    echo -e "${YELLOW}▶ Step 8: Backing up current version...${NC}"
    CURRENT_RELEASE=$(remote_exec "readlink $CURRENT_LINK")
    remote_exec "
        BACKUP_FILE=$BACKUP_DIR/backup_$TIMESTAMP.tar.gz
        tar -czf \$BACKUP_FILE -C $DEPLOY_PATH current
    "
    echo -e "${GREEN}✓ Backup created${NC}"
fi

# Step 9: Switch to new release (ATOMIC OPERATION)
echo -e "${YELLOW}▶ Step 9: Switching to new release...${NC}"
remote_exec "ln -nfs $RELEASE_DIR $CURRENT_LINK"
echo -e "${GREEN}✓ Switched to new release${NC}"

# Step 10: Reload services
echo -e "${YELLOW}▶ Step 10: Reloading services...${NC}"
remote_exec "
    # Reload PHP-FPM (if using)
    sudo systemctl reload php8.1-fpm 2>/dev/null || true
    
    # Reload Nginx
    sudo systemctl reload nginx 2>/dev/null || true
    
    # Clear OPcache
    curl -s http://localhost/backend/public/optimize.php >/dev/null 2>&1 || true
"
echo -e "${GREEN}✓ Services reloaded${NC}"

# Step 11: Post-deployment verification
echo -e "${YELLOW}▶ Step 11: Post-deployment verification...${NC}"
sleep 2

# Check if website is responding
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$DEPLOY_HOST/api/health" || echo "000")
if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Website is responding (HTTP $HTTP_STATUS)${NC}"
else
    echo -e "${RED}✗ Website not responding properly (HTTP $HTTP_STATUS)${NC}"
    echo -e "${YELLOW}Rolling back...${NC}"
    
    # Rollback to previous version
    PREVIOUS_RELEASE=$(remote_exec "ls -t $RELEASES_DIR | sed -n '2p'")
    remote_exec "ln -nfs $RELEASES_DIR/$PREVIOUS_RELEASE $CURRENT_LINK"
    remote_exec "sudo systemctl reload php8.1-fpm nginx"
    
    echo -e "${RED}✗ Rolled back to previous version${NC}"
    exit 1
fi

# Step 12: Cleanup old releases
echo -e "${YELLOW}▶ Step 12: Cleaning up old releases...${NC}"
remote_exec "
    cd $RELEASES_DIR
    ls -t | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf
"
echo -e "${GREEN}✓ Old releases cleaned${NC}"

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Deployment Successful!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Release: ${BLUE}$TIMESTAMP${NC}"
echo -e "Path: ${BLUE}$RELEASE_DIR${NC}"
echo -e "Current: ${BLUE}$CURRENT_LINK${NC}"
echo ""
echo -e "${YELLOW}Rollback command:${NC}"
echo -e "ssh $DEPLOY_USER@$DEPLOY_HOST 'ln -nfs $RELEASES_DIR/PREVIOUS_RELEASE $CURRENT_LINK'"
echo ""
echo -e "${GREEN}🎉 Zero downtime achieved!${NC}"
