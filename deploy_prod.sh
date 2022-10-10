git checkout production
git pull

composer install

cd www-src
npm install
npm run build-prod
