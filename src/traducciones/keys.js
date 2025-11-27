// keys usadas en las traducciones... podemos agregar separacion logica en el armado
const sceneGameCoop = {
  score: "Puntaje",
  player1: "JUGADOR 1",
  player2: "JUGADOR 2",
  actionPlayer1: "MOVERSE Y DISPARAR",
  actionPlayer2: "APUNTAR Y SALTAR"
};

const sceneGameVersus = {
  player1: "JUGADOR 1",
  player2: "JUGADOR 2",
  actionPlayer1: "Moverse, Saltar y Disparar",
  actionPlayer2: "Moverse, Elegir Objeto y Lanzar"
}

const sceneInitialMenu = {
  cooperative: "COOPERATIVO",
  versus: "VERSUS",
  howToPlay: "CÓMO JUGAR",
};

const sceneGameTutorialCoop = {
  descriptionTextCoop: "Recoge la gomera para poder disparar y destruir el camion",
  player1: "JUGADOR 1",
  player2: "JUGADOR 2",
  actionPlayer1: "MOVERSE Y DISPARAR",
  actionPlayer2: "APUNTAR Y SALTAR",
  dodgeText: "¡ESQUIVA!",
  jumpText: "¡SALTA!",
  collectText: "¡RECOGE!",
  continueButton: "CONTINUAR"
}

const sceneGameTutorialVersus = {
  descriptionTextVersus: "El primero que derrote a su oponente gana",
  player1: "JUGADOR 1",
  player2: "JUGADOR 2",
  actionPlayer1: "Moverse, Saltar y Disparar",
  actionPlayer2: "Elegir y lanzar obstaculos",
  dodgeText: "¡ESQUIVA!",
  jumpText: "¡SALTA!",
  collectText: "¡RECOGE!",
  continueButton: "CONTINUAR"
}

const sceneGameOvercoop = {
  gameOver: "Derrota",
  retry: "Volver a Jugar",
  backToMenu: "Volver al Menú"
};

const sceneGameOverVersus = {
  victoriaPlayer1: "¡Jugador 1 (Bici) Gana!",
  victoriaPlayer2: "¡Jugador 2 (Camión) Gana!",
  retry: "Volver a Jugar",
  backToMenu: "Volver al Menú"
};

export default {
  sceneGameCoop,
  sceneGameVersus,
  sceneGameTutorialCoop,
  sceneGameTutorialVersus,
  sceneInitialMenu,
  sceneGameOvercoop,
  sceneGameOverVersus,
};