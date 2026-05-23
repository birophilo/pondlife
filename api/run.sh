#!/bin/sh

export APP_MODULE=${APP_MODULE-main:app}
export HOST=${HOST:-0.0.0.0}
export PORT=${PORT:-8000}

python3 -c '
import socket, sys

port = int(sys.argv[1])
host = sys.argv[2]

if host in ("", "0.0.0.0"):
    bind_addr = ("0.0.0.0", port)
else:
    bind_addr = (host, port)

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    sock.bind(bind_addr)
except OSError:
    listen_on = "{}:{}".format(*bind_addr)
    sys.stderr.write(
        "Cannot start FastAPI: port {} is already in use.\n"
        "Another process is likely listening on {}; stop it first, "
        "or run with a different PORT (e.g. PORT=8001).\n".format(port, listen_on)
    )
    sys.exit(1)
finally:
    sock.close()
' "$PORT" "$HOST" || exit 1

exec uvicorn --host $HOST --port $PORT "$APP_MODULE"
