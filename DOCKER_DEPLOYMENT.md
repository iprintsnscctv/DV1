# Docker Deployment Guide for Diversion Transient Web App

This web application is containerized and ready for deployment on any Docker Manager (Portainer, Docker Compose, Docker Swarm, Coolify, or Dokku).

---

## 1. Quick Deploy with Docker Compose (Recommended)

From the project root directory, run:

```bash
# Build and start the container in detached mode
docker compose up -d --build

# View real-time logs
docker compose logs -f

# Check container health status
docker compose ps
```

The application will be live at:
`http://localhost:3000` (or your server's IP address: `http://<YOUR_SERVER_IP>:3000`).

---

## 2. Deploying via Portainer (Web UI)

If you use **Portainer**:
1. Log in to your Portainer Dashboard.
2. Go to **Stacks** > **+ Add stack**.
3. Name the stack: `diversion-transient`.
4. Choose **Web editor** and paste the contents of `docker-compose.yml` (or select **Repository** and link your Git repo).
5. Click **Deploy the stack**.
6. Portainer will build the image, configure persistent volume `diversion_transient_data`, and start the container with automatic health monitoring.

---

## 3. Standard Docker CLI (Without Compose)

```bash
# 1. Build the Docker image
docker build -t diversion-transient-app:latest .

# 2. Create a volume for persistent booking data
docker volume create diversion_transient_data

# 3. Run the container
docker run -d \
  --name diversion-transient-app \
  --restart unless-stopped \
  -p 3000:3000 \
  -v diversion_transient_data:/app/data \
  diversion-transient-app:latest
```

---

## 4. Key Configuration Details

* **Port**: Runs on port `3000`. You can map it to another port (e.g. `-p 80:3000` or `-p 8080:3000`).
* **Health Check**: Configured at `/api/health` returning `200 OK` and uptime metadata.
* **Persistent Storage**: All rooms, reservations, custom rate matrix overrides, and housekeeping statuses are automatically persisted to `/app/data/data.json` inside the container and backed up to the host volume.
* **Non-Root Security**: The container drops privileges and executes as the `node` user (UID 1000).

---

## 5. Supabase PostgreSQL Integration (Optional Cloud Database)

To connect the application to your Supabase PostgreSQL project:
1. Copy your Project URL and Anon or Service Role key from the Supabase Dashboard.
2. In your Docker Compose / Stack environment variables:
   ```yaml
   environment:
     - SUPABASE_URL=https://your-project.supabase.co
     - SUPABASE_ANON_KEY=your-supabase-anon-key
     - SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   ```
3. Open the application, go to **Front Desk Admin** &rarr; click **Supabase Settings** &rarr; **SQL Table Schema** &rarr; click **Copy SQL Schema**.
4. Paste and run the SQL script in your Supabase **SQL Editor**.
5. Click **Push Local Rooms & Bookings to Supabase** to seed your cloud database with 1 click!

