source ~/.bashrc

composer install

cd www-src
npm install
npm run build-prod
