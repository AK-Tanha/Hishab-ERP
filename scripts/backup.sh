#!/usr/bin/env bash
# Daily pg_dump backup to object storage.
# Configure: DATABASE_URL, BACKUP_DIR (local) or S3_BUCKET + AWS credentials.
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_DIR:-./backups}"
mkdir -p "$BACKUP_DIR"
FILE="$BACKUP_DIR/hishab_$TIMESTAMP.sql.gz"

echo "Backing up database to $FILE ..."
pg_dump "$DATABASE_URL" | gzip > "$FILE"
echo "Backup complete: $FILE"

# Optional: upload to S3
if [ -n "${S3_BUCKET:-}" ]; then
  aws s3 cp "$FILE" "s3://$S3_BUCKET/hishab/backups/" && echo "Uploaded to S3"
fi

# Retain only last 7 days of local backups
find "$BACKUP_DIR" -name "hishab_*.sql.gz" -mtime +7 -delete
