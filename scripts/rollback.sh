#!/bin/bash

###############################################################################
# Quick Rollback Script
# Usage: ./rollback.sh [release_timestamp]
# If no timestamp provided, rolls back to previous release
###############################################################################

set -e

# Configuration
DEPLOY_USER="your_ssh_user"
DEPLOY_HOST="your_server_ip"
DEPLOY_PATH="/var/www/alkana-coating"
RELEASES_DIR="$DEPLOY_PATH/releases"
CURRENT_LINK="$DEPLOY_PATH/current"

RELEASE_TO_ROLLBACK="${1}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}⏪ Rollback Deployment${NC}"
echo -e "${YELLOW}========================================${NC}"

# Function to execute remote commands
remote_exec() {
    ssh "$DEPLOY_USER@$DEPLOY_HOST" "$@"
}

# Get current release
CURRENT_RELEASE=$(remote_exec "readlink $CURRENT_LINK | xargs basename")
echo -e "Current release: ${GREEN}$CURRENT_RELEASE${NC}"

# If no specific release specified, get previous one
if [ -z "$RELEASE_TO_ROLLBACK" ]; then
    echo -e "\n${YELLOW}Available releases:${NC}"
    remote_exec "ls -lt $RELEASES_DIR | tail -n +2 | head -10"
    
    RELEASE_TO_ROLLBACK=$(remote_exec "ls -t $RELEASES_DIR | sed -n '2p'")
    echo -e "\nRolling back to: ${GREEN}$RELEASE_TO_ROLLBACK${NC}"
else
    echo -e "Rolling back to specified release: ${GREEN}$RELEASE_TO_ROLLBACK${NC}"
fi

# Confirm rollback
read -p "Are you sure you want to rollback? (yes/no) " -r
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${RED}Rollback cancelled${NC}"
    exit 1
fi

# Perform rollback
echo -e "\n${YELLOW}▶ Performing rollback...${NC}"
remote_exec "ln -nfs $RELEASES_DIR/$RELEASE_TO_ROLLBACK $CURRENT_LINK"

# Reload services
echo -e "${YELLOW}▶ Reloading services...${NC}"
remote_exec "
    sudo systemctl reload php8.1-fpm 2>/dev/null || true
    sudo systemctl reload nginx 2>/dev/null || true
"

# Verify
sleep 2
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://$DEPLOY_HOST/api/health" || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "\n${GREEN}✓ Rollback successful!${NC}"
    echo -e "Active release: ${GREEN}$RELEASE_TO_ROLLBACK${NC}"
else
    echo -e "\n${RED}✗ Rollback completed but health check failed (HTTP $HTTP_STATUS)${NC}"
fi
