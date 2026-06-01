#!/bin/bash
# Backup script for AI-Powered Financial Document Similarity
# Backs up PostgreSQL database and Qdrant snapshot

set -e

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

echo "Starting backup process at $DATE..."

# 1. Backup PostgreSQL
echo "Backing up PostgreSQL database..."
docker exec -t simdocfinder-db-1 pg_dump -U admin simdocfinder > "$BACKUP_DIR/db_backup_$DATE.sql"
echo "✅ Database backup completed."

# 2. Backup Qdrant (Create snapshot via API)
echo "Creating Qdrant snapshot..."
# Requires jq to extract the snapshot name if we wanted to download it, but for local volume we just trigger it
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:6333/collections/financial_documents/snapshots)
if [ "$HTTP_CODE" -eq 200 ] || [ "$HTTP_CODE" -eq 202 ]; then
    echo "✅ Qdrant snapshot created successfully."
else
    echo "❌ Failed to create Qdrant snapshot. HTTP Code: $HTTP_CODE"
fi

# Note: The Qdrant snapshot resides inside the docker volume qdrant_data.
# To fully back it up to the host disk, we copy it out:
echo "Copying Qdrant snapshots from container..."
docker cp simdocfinder-qdrant-1:/qdrant/snapshots/ "$BACKUP_DIR/qdrant_snapshots_$DATE/"

# 3. Archive documents folder
echo "Archiving stored document files..."
if [ -d "./backend/uploads" ]; then
    tar -czf "$BACKUP_DIR/documents_backup_$DATE.tar.gz" -C ./backend uploads
    echo "✅ Documents backup completed."
else
    echo "⚠️ No documents folder found at ./backend/uploads to backup."
fi

echo "Backup complete! All files saved in $BACKUP_DIR"
