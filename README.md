# CS375Spotify

A multiplayer music quiz game

# Stack

- Backend: Express
- Frontend: NextJS

# Installing locally

## Backend

- `cd backend`
- `npm install`

## Frontend

- `cd frontend`
- `npm install`

## Shortcut Scripts:

- Windows: `install-dependencies.bat`

# Running Locally

## Secrets

- `cd backend`
- create a file called `.env` with the following contents (an example of these contents is in `backend/.env_template`)

```
SERVER_PROTOCOL="http://"
SERVER_HOST="localhost"
SERVER_PORT="3001"

CLIENT_PROTOCOL="http://"
CLIENT_HOST="localhost"
CLIENT_PORT="3000"

# Spotify Secrets
CLIENT_ID="<Spotify Client ID>"
CLIENT_SECRET="<Spotify Client Secret>"
```

- `cd frontend`
- create a file called `.env.local` with the following contents (an example of these contents is in `frontend/.env_template`)

```
SERVER_PROTOCOL="http://"
SERVER_HOST="localhost"
SERVER_PORT="3001"

CLIENT_PROTOCOL="http://"
CLIENT_HOST="localhost"
CLIENT_PORT="3000"
```

## Backend

- `cd backend`
- `node server.js`

## Frontend

- `cd frontend`
- `npm run dev`
- visit http://localhost:3000

## Shortcut Scripts

- `run.bat`

# Resources

- https://nextjs.org/
- https://socket.io/
- https://developer.spotify.com/documentation/web-api
