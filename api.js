const fs = require('fs');

//variable globales
var listeMots = [];
var erreur = 0;
var mot = "";
var motDevine = [];
var minLettre = 4;
var maxLettre = 5

//dictionnaire qui contiendra toutes les parties en cours
var gameInstances = {};

//lecture du fichier des Misérables et récupération des mots écrits en minuscule
fs.readFile('Miserables.txt', "UTF-8", function(error, data) {
    if (error) {
        console.error(error);
        return;
    }

    var texte = data.split(/[(\r?\n),. ]/);

    for (let i=0; i<texte.length; i++) {
        if (texte[i].length >= 4 && texte[i].length <= 12 ) {
            var test = true;
            for (let j=0; j<texte[i].length; j++) {
                if (texte[i].charCodeAt(j) < 97 || texte[i].charCodeAt(j) > 122) {
                    test = false;
                }
            }
            if (test){
                listeMots.push(texte[i]);
            }
        }
    };
});

//class Game pour gérer plusiers jouers en même temps
class Game {
    constructor(level) {
      this.id = id;
      this.wordToDiscover = '';
      this.errors = 0;
      this.wordDiscovered = [];
    }
  
    testLetter(letter) {
    }
  }
  

//fonction manage request qui fait des requêtes
function manageRequest(request, response) {
    var url = request.url;
    const urlElements = url.split('?')[0].split('/');
    //on récupère le paramètre après api/
    const parametre = urlElements[urlElements.indexOf('api') + 1];

    //on renvoie un mot
    if (parametre === 'getWord') {
        response.statusCode = 200;
        mot = listeMots[Math.floor(Math.random() * listeMots.length)];
        response.end(mot);
    }

    //on renvoie la longueur d'un mot
    else if (parametre === 'newGame'){
        //on récupère le niveau demandé pour adapter la longueur du mot à trouver
        const level = url.split('level=')[1];
        if(level==="facile"){
            minLettre=4;
            maxLettre=5;
        } 
        else if(level==="moyen"){
            minLettre=6;
            maxLettre=8;
        }
        else if(level==="difficile"){
            minLettre=9;
            maxLettre=10;
        }
        else if(level==="impossible"){
            minLettre=11;
            maxLettre=12;
        }

        //on cherche un mot de la bonne longueur
        mot = listeMots[Math.floor(Math.random() * listeMots.length)];
        while (mot.length < minLettre || mot.length > maxLettre){
            mot = listeMots[Math.floor(Math.random() * listeMots.length)];
        }

        erreur = 0;
        motDevine = [];
        for (let i = 0; i < mot.length; i++){
            motDevine.push('_');
        }
        response.statusCode = 200;
        response.end(mot.length.toString());
    }

    //on teste une lettre et on renvoie un dictionnaire, objet json
    else if (parametre === 'testLetter'){
        const lettre = url.split('letter=')[1];
        var victoire = true;
        var defaite = false;
        var test = false;

        //on vérifier si la lettre est dans le mot pour l'afficher
        for (let i = 0; i < mot.length; i++) {
            if (mot[i] === lettre) {
                motDevine[i] = lettre;
                test=true;
            }
        }

        //on incrémente le nombre d'erreurs
        if (test===false){
            erreur++;
        }

        //on vérifier si on a gagné la partie ou pas
        for (let i = 0; i < motDevine.length; i++) {
            if (motDevine[i] === "_") {
                victoire=false;
            }
        }

        //si on a fait 10 erreur on affiche le mot
        if (erreur===10){
            motDevine = mot;
            defaite = true;
        }

        //objet dictionnaire
        var dico = {
            "tabPosition" : motDevine,
            "victoire" : victoire,
            "defaite": defaite,
            "erreur" : erreur
        }

        response.end(JSON.stringify(dico));
    }

    else {
        response.statusCode = 404;
        response.end("Error: 404 - Il n'y a pas de mot");
    }
}

exports.manage = manageRequest;