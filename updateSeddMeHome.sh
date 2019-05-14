#!/bin/sh

echo "Updating to server revision..."
git fetch --all
git reset --hard origin/master

echo "Building backend"
npm install
npm run ng build backend -- --prod

sudo systemctl daemon-reload
# node dist/apps/backend/main.js dist/apps/backend/main.js.map >> /var/log/seed-me-home.log   2>&1


echo "Restarting backend"
sudo service seed-me-home stop
sudo service seed-me-home start

#echo "Building frontend"
npm run ng build frontend --prod


