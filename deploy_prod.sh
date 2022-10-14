echo $HOME
whoami

source $HOME/.bashrc

composer install

cd www-src
npm install
npm run build-prod
