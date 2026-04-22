const url = require('url');
const path = require('path');
const fs = require('fs');

const chemin = "./front";

const mimeTypes = {
     '.ico': 'image/x-icon',
     '.html': 'text/html',
     '.js': 'text/javascript',
     '.json': 'application/json',
     '.css': 'text/css',
     '.png': 'image/png',
     '.jpg': 'image/jpeg',
     '.wav': 'audio/wav',
     '.mp3': 'audio/mpeg',
     '.svg': 'image/svg+xml',
     '.pdf': 'application/pdf',
     '.doc': 'application/msword',
     '.md': 'text/plain',
     'default': 'application/octet-stream'
};

function manageRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    const index = 'index.html';
    //création du chemin
    var monChemin = path.join(chemin, pathname);

    //création d'un chemin par défault pour ne pas devoir écrire index à chaque fois
    const cheminDefault = fs.existsSync(monChemin) && fs.statSync(monChemin).isDirectory();
    if (cheminDefault) {
        monChemin = path.join(monChemin, index);
    }

    if (pathname.includes('..')) {
        response.statusCode = 403;
        response.end('Forbidden');
        return;
    }

    fs.exists(monChemin, function(err) {
        //s'il y a une erreur on renvoie la page 404
        if (!err) {
            response.statusCode = 404;
            var monCheminError = './front/404.html';

            fs.readFile(monCheminError, function(error, data) {
                if (error) {
                    response.statusCode = 500;
                    response.end(`Internal Server Error: ${error}`);
                } 
                else {
                    var ext = path.parse(monCheminError).ext;
                    var contentType = mimeTypes[ext] || mimeTypes['default'];

                    response.setHeader('Content-Type', contentType);
                    response.end(data);
                }
            });
        } 
        //on renvoie la page demandée
        else {
            fs.readFile(monChemin, function(error, data) {
                if (error) {
                    response.statusCode = 500;
                    response.end(`Internal Server Error: ${error}`);
                }
                else {
                    var ext = path.parse(monChemin).ext;
                    var contentType = mimeTypes[ext] || mimeTypes['default'];

                    response.setHeader('Content-Type', contentType);
                    response.statusCode = 200;
                    response.end(data);
                }
            });
        }
    });
}

exports.manage = manageRequest;