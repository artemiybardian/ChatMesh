#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE chatmesh_chat;
    CREATE DATABASE chatmesh_notifications;
    GRANT ALL PRIVILEGES ON DATABASE chatmesh_chat TO $POSTGRES_USER;
    GRANT ALL PRIVILEGES ON DATABASE chatmesh_notifications TO $POSTGRES_USER;
EOSQL
