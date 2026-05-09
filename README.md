# MERN Stack Deployment on VM

---

# PART 1 — Connect to VM

From your local machine terminal:

```bash
ssh -i Deployment_key.pem azureuser@YOUR_PUBLIC_IP
```

Example:

```bash
ssh -i Deployment_key.pem azureuser@4.188.82.79
```

If it shows gave extra permissions to the PEM file, which SSH considers insecure. Set : Owner can only read
```bash
chmod 400 Deployment_key.pem
```

---

# PART 2 — Update Ubuntu

After login:

```bash
sudo apt update && sudo apt upgrade -y
```

If restart-services screen appears:

- Press `TAB`
- Select `<OK>`
- Press `ENTER`

---

# PART 3 — Install Node.js

## Add NodeSource Repository

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

## Install Node.js

```bash
sudo apt install -y nodejs
```

## Verify

```bash
node -v
npm -v
```

---

# PART 4 — Install Git

```bash
sudo apt install git -y
```

---

# PART 5 — Clone GitHub Repository

```bash
git clone YOUR_GITHUB_REPO_LINK
```

Example:

```bash
git clone https://github.com/USERNAME/TodoListManager.git
```

## Go into Project

```bash
cd TodoListManager
```

## Verify

```bash
ls
```

Should show:

```text
backend
frontend
README.md
```

---

# PART 6 — Backend Setup

## Move to Backend

```bash
cd backend
```

## Install Backend Dependencies

VERY IMPORTANT:

```bash
npm install
```

Without this:

```text
Cannot find module 'express'
```

will happen.

## Install PM2

```bash
sudo npm install -g pm2
```

## Start Backend

```bash
pm2 start server.js --name backend
```

## Verify

```bash
pm2 list
```

Must show:

```text
status → online
```

## Save PM2

```bash
pm2 save
```

## Enable Auto Start on Reboot

```bash
pm2 startup
```

It will give another command.

COPY and RUN that command too.

Example:

```bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u azureuser --hp /home/azureuser
```

---

# PART 7 — Frontend Setup

## Move to Frontend

```bash
cd ../frontend
```

## Install Frontend Dependencies

```bash
npm install
```

## Build React App

```bash
npm run build
```

## Verify Build Folder

```bash
ls build
```

Must show:

```text
index.html
static
asset-manifest.json
```

---

# PART 8 — Install Nginx

```bash
sudo apt install nginx -y
```

---

# PART 9 — Configure Nginx

## Create Config File

```bash
sudo nano /etc/nginx/sites-available/app
```

## Paste This

Replace `YOUR_PUBLIC_IP`.

```nginx
server {
    listen 80;
    server_name YOUR_PUBLIC_IP;

    root /home/azureuser/TodoListManager/frontend/build;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Save File

- `CTRL + O`
- `ENTER`
- `CTRL + X`

## Enable Config

```bash
sudo ln -s /etc/nginx/sites-available/app /etc/nginx/sites-enabled/
```

## Remove Default Config

```bash
sudo rm /etc/nginx/sites-enabled/default
```

## Test Nginx Config

```bash
sudo nginx -t
```

Must show:

```text
syntax is ok
test is successful
```

## Restart Nginx

```bash
sudo systemctl restart nginx
```

---

# PART 10 — Fix Permissions (IMPORTANT)

Without this you may get:

```text
Permission denied
500 Internal Server Error
```

Run:

```bash
sudo chmod 755 /home/azureuser
sudo chmod -R 755 /home/azureuser/TodoListManager
```

## Restart Nginx Again

```bash
sudo systemctl restart nginx
```

---

# PART 11 — Final Verification

## Check Backend

```bash
pm2 list
```

Must show:

```text
online
```

## Check Nginx

```bash
sudo systemctl status nginx
```

## Open Website

Browser:

```text
http://YOUR_PUBLIC_IP
```

## Check API Directly

```text
http://YOUR_PUBLIC_IP/api/tasks
```

Should show:

```json
[]
```

or tasks JSON.

---

# PART 12 — Efficient Debugging Commands

## Backend Logs

```bash
pm2 logs backend --lines 50
```

## Nginx Error Logs

```bash
sudo tail -50 /var/log/nginx/error.log
```

## Nginx Config Test

```bash
sudo nginx -t
```

## Restart Backend

```bash
pm2 restart backend
```

## Restart Nginx

```bash
sudo systemctl restart nginx
```

## Check Port 5000

```bash
sudo lsof -i :5000
```
