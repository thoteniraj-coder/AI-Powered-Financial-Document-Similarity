#!/bin/bash
# Restore script for AI-Powered Financial Document Similarity

set -e

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <db_backup_file.sql> <documents_backup_file.tar.gz>"
    echo "Note: Qdrant snapshots must be restored via the Qdrant API or by copying to the snapshots directory."
    exit 1
fi

DB_BACKUP=$1
DOCS_BACKUP=$2

echo "Starting restore process..."

# 1. Restore PostgreSQL
if [ -f "$DB_BACKUP" ]; then
    echo "Restoring PostgreSQL database..."
    # Drop and recreate schema to ensure clean slate, or just restore on top (requires careful handling)
    # Using docker exec to pipe the sql file
    cat "$DB_BACKUP" | docker exec -i simdocfinder-db-1 psql -U admin -d simdocfinder
    echo "✅ Database restore completed."
else
    echo "❌ Database backup file not found: $DB_BACKUP"
    exit 1
fi

# 2. Restore Documents
if [ -f "$DOCS_BACKUP" ]; then
    echo "Restoring documents..."
    mkdir -p ./backend/uploads
    tar -xzf "$DOCS_BACKUP" -C ./backend
    echo "✅ Documents restore completed."
else
    echo "❌ Documents backup file not found: $DOCS_BACKUP"
    exit 1
fi

echo "Restore complete! Please restart your containers."
