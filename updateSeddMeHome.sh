#!/bin/bash

echo
echo "Updating to server revision"
echo "---------------------------"
git fetch --all
git reset --hard origin/master

echo
echo "Install dependencies"
echo "--------------------"
npm install

echo
echo "Building backend"
echo "----------------"
npm run ng build backend -- --prod

echo
echo "Restarting backend"
echo "------------------"
sudo systemctl daemon-reload
sudo service seed-me-home stop
sudo service seed-me-home start

echo
echo "Building frontend"
echo "-----------------"
npm run ng build frontend -- --prod

echo
echo "deploy frontend"
echo "---------------"
trgDist="distFrontendA"
oldDist="distFrontendB"
if [[ -d ${trgDist} ]]
then
  trgDist="distFrontendB"
  oldDist="distFrontendA"
fi
echo "deploying to ${trgDist}"
rm -fr ${trgDist}
mv dist/apps/frontend ${trgDist}

rm distFrontendCurrent
ln -s ${trgDist} distFrontendCurrent

rm -fr ${oldDist}

echo
echo "done."


