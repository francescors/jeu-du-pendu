var boutonJouer = document.getElementById('boutonJouer');
var monHTML = document.getElementById('motHTML');
boutonJouer.addEventListener('click', newGame);
var boutonTester = document.getElementById('boutonTester');

//test lettre quand on clic sur bouton "Tester"
boutonTester.addEventListener('click', function() {
  testerLettre();
  input.focus();
});

//test lettre quand on clic sur la touche "Entrée"
var input = document.querySelector('input[type=text]');
input.addEventListener('keyup', function(event) {
  if (event.code === 'Enter') {
    testerLettre();
  }
});

//test lettre quand on clic sur un bouton de l'alphabet
var lettresAlphabet = document.querySelectorAll('#lettresAlphabet button');
for (var i = 0; i < lettresAlphabet.length; i++) {
  lettresAlphabet[i].addEventListener('click', function() {
    var lettre = this.innerText.toLowerCase();
    testerLettre(lettre);
    if (motDecouvrir.includes(lettre)) {
      this.classList.add('correcte');
    } 
    else {
      this.classList.add('correcte');
    }
    this.disabled = true;
    input.focus();
  });
}

var boutonRejouer = document.getElementById('boutonRejouer');

//appel fonction rejouer quand on clic sur bouton "rejouer"
boutonRejouer.addEventListener('click', rejouer);

var erreurs = 0;
var motDecouvrir = '';
var motDecouvert = [];

var niveauDifficulte = document.getElementById('niveauDifficulte');
var regles = document.getElementById('regles');

//fonction qui envoie une requete pour recuperer la longueur du mot en fonction du niveau
async function demandeMot(niveau) {
  return fetch('http://localhost:8080/api/newGame?level=' + niveau)
  .then(async function(response) {
    if (response.ok) {
      var text = await response.text();
      return text;
    }
    else {
      return demandeMot();
    }
  })
}

//fonction newGame qui fait commencer une partie
async function newGame() {
  //on récupère le niveau
  var level = niveauDifficulte.value;

  //on désactive tous les boutons
  for (var w = 0; w < lettresAlphabet.length; w++) {
    lettresAlphabet[w].disabled = true;
  }
  boutonTester.disabled = true;
  input.disabled = true;

  //affichage des éléments initialement cachées
  const elements = document.getElementsByClassName('notDisplayed');
  let len = elements.length;
  let i = 0;
  while (i < len) {
    elements[0].classList.remove('notDisplayed');
    i++;
  }

  //on cache les parties non nécessaires
  boutonJouer.classList.add('notDisplayed');
  boutonRejouer.classList.add('notDisplayed');
  niveauDifficulte.classList.add('notDisplayed');
  regles.classList.add('notDisplayed');

  //récupération de la longueur du mot
  motDecouvrir = await demandeMot(level);

  erreurs = 0;
  motDecouvert = [];

  //transformation du mot qu'on découvre en tirets
  for (let i = 0; i < motDecouvrir; i++) {
    motDecouvert.push('_');
  }

  var motTemp = motDecouvert.join(' ');
  monHTML.innerText = motTemp;
  input.value = '';

  //affichage du nombre d'erreurs et du niveau actuels
  document.getElementById('nombreErreurs').innerText = '0';
  document.getElementById('niveau').innerText = level;

  for (var w = 0; w < lettresAlphabet.length; w++) {
    lettresAlphabet[w].disabled = false;
  }
  boutonTester.disabled = false;
  input.disabled = false;

  input.focus();
}

//fonction qui teste une lettre pour vérifier si elle est dans le mot
function testerLettre(lettre = '') {
  //si on n'a pas d'argument, la varible lettre prend la valeur de l'input
  if (!lettre) {
    lettre = input.value.toLowerCase();
    boutonRejouer.classList.add('notDisplayed');
  }

  //on considère que les lettres simples
  if (lettre.length != 1){
    input.value = ''
    input.focus();
    return;
  }

  //requete à notre API pour tester une lettre
  return fetch('http://localhost:8080/api/testLetter?letter=' + lettre)
    .then(async function(response) {
      if (response.ok) {
        const dico = await response.json();
        motDecouvrir = dico["tabPosition"];
        var motTemp = motDecouvert.join(' ');
        monHTML.innerText = motTemp;
        victoire = dico["victoire"];
        defaite = dico["defaite"];
        erreurs = dico["erreur"];

        //si la lettre est dans le mot à découvrir on l'affiche
        if (motDecouvrir.includes(lettre)) {
          for (var i = 0; i < motDecouvrir.length; i++) {
            if (motDecouvrir[i] === lettre) {
              motDecouvert[i] = lettre;
            }
          }
      
          //on ajoute cette lettre dans la classe "correcte"
          //l'utilisateur pourra ainsi voir les lettres correctes 
          lettresAlphabet.forEach((button) => {
            if (button.innerText.toLowerCase() === lettre) {
              button.classList.add('correcte');
              button.disabled = true;
            }
          });
          
          monHTML.innerText = motDecouvert.join(' ');
      
          //si la variable victoire est vraie alors l'utilisateur à gagné
          //on désactive tous les boutons et on affiche un message de fin 
          //ainsi que le bouton pour sélectionner le niveau de difficulté et rejouer
          if (victoire) {
            boutonTester.disabled = true;
            input.disabled = true;
            for (var i = 0; i < lettresAlphabet.length; i++) {
              lettresAlphabet[i].disabled = true;
            }
            boutonRejouer.classList.remove('notDisplayed');
            niveauDifficulte.classList.remove('notDisplayed');
            document.getElementById('resultat').innerText = 'VICTOIRE !';
          }
        }
      
        //cas où la lettre n'est pas dans le mot
        else {
          //affichage de l'image correspondante
          changeImage(erreurs);
      
          //on ajoute cette lettre dans la classe "incorrecte"
          //l'utilisateur pourra ainsi voir les lettres incorrectes
          lettresAlphabet.forEach((button) => {
            if (button.innerText.toLowerCase() === lettre) {
              button.classList.add('incorrecte');
              button.disabled = true;
            }
          });
      
          //si la variable défaite est vraie alors le jeu est fini
          //on désactive les boutons et on affiche le bouton pour rejouer ainsi
          //que le selecteur pour choisir le niveau de difficulté
          if (defaite) {
            boutonTester.disabled = true;
            input.disabled = true;
            for (var i = 0; i < lettresAlphabet.length; i++) {
              lettresAlphabet[i].disabled = true;
            }
            boutonRejouer.classList.remove('notDisplayed');
            niveauDifficulte.classList.remove('notDisplayed');
            document.getElementById('resultat').innerText = 'PERDU, le mot était: ' + motDecouvrir;
          }
        }
      }
      else {
        return testerLettre(lettre);
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    })
    //on efface le contenu de l'input
    .finally(() => {
      input.value = '';
    });
}

//fonction qui change l'affichage des images
function changeImage(erreurs) {
  const imageSource = 'images/pendu' + erreurs + '.png';
  const image = document.getElementById('imagePendu');
  image.setAttribute('src', imageSource);

  const nombreErreurs = document.getElementById('nombreErreurs');
  nombreErreurs.innerText = erreurs;
}

//fonction qui est appelée quand on clic sur le bouton "rejouer"
//on initialise tout et on commence une nouvelle partie
function rejouer() {
  boutonJouer.disabled = false;
  for (var i = 0; i < lettresAlphabet.length; i++) {
    lettresAlphabet[i].disabled = false;
    lettresAlphabet[i].classList.remove('correcte');
    lettresAlphabet[i].classList.remove('incorrecte');
  }
  
  boutonRejouer.classList.add('notDisplayed');
  boutonTester.disabled = false;
  input.disabled = false;
  document.getElementById('resultat').innerText = '';
  changeImage(0);
  monHTML.innerText = "Recherche d'un mot, patientez..."

  newGame();
}