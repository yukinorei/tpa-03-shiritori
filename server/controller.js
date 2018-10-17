const Game = require('./game/Game');
const gameInstances = require('./game/gameInstances');

const sendInvalidPlayerNameError = function(res) {
  res.json({
    message: 'invalid player name',
    gameOver: false,
  });
};

const getUsedWords = function(req, res) {
  const { playerName } = req.query;
  if (!playerName) {
    sendInvalidPlayerNameError(res);
    return;
  }

  const game = gameInstances.get(playerName);
  if (!game) {
    res.json({
      words: [],
      gameOver: false,
    });
    return;
  }

  res.json({
    words: game.getUsedWords(),
    gameOver: game.isOver(),
  });
};

const playWord = function(req, res) {
  const {
    inputWord,
    playerName,
  } = req.body;

  if (!playerName) {
    sendInvalidPlayerNameError(res);
    return;
  }

  let game = gameInstances.get(playerName);

  if (!game) {
    gameInstances.set(playerName, new Game());
    game = gameInstances.get(playerName);
  }

  if (game.isOver()) {
    res.json({
      valid: false,
      gameOver: true,
    });
    return;
  }

  if (game.hasWordBeenPlayed(inputWord)) {
    res.json({
      valid: false,
      gameOver: false,
      validations: {
        isUnique: false,
      },
    });
    return;
  }

  game.addWord(inputWord)
    .then((status) => {
      res.json({
        ...status,
        gameOver: false,
      });
    });
};

const resetGame = function(req, res) {
  const {
    playerName,
  } = req.body;
  gameInstances.set(playerName, new Game());
  console.log('TODO: Reset a game identified by playerName');
};

module.exports = {
  getUsedWords,
  playWord,
  resetGame,
};
