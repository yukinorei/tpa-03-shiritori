<template>
  <div class="shiritori">
    <div class="play-word">
      <h1>しりとりしよう。</h1>
      <p>(カタカナ単語はひらがなで入力してね。)</p>
      <form v-on:submit="handleSubmit">
        <h2 class="error-message">{{ errorMessage }}</h2>
        <input
          v-on:keyup="handleNameChange"
          autocomplete="off"
          placeholder="名前"
          class="word-input"
          type="text"
          v-model="playerName"
        />
        <input
          autocomplete="off"
          placeholder="言葉"
          class="word-input"
          type="text"
          v-model="inputWord"
        />
        <button type="submit">Submit</button>
      </form>
      <h2 v-if="lost" class="gameover-message">GAME OVER</h2>
      <h2
        class="message"
        v-bind:class="{
          'valid': !lost,
          'invalid': lost,
        }"
      >
        {{ message }}
      </h2>
      <button v-if="lost" v-on:click="reset">Reset</button>
    </div>
    <div class="used-words">
      <h2 class="score">Score: {{ score }}</h2>
      <ul>
        <li v-for="(word, idx) in playedWords" v-bind:key="`${word}-${idx}`" >
          {{ word }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import apiService from '../services/api-service';

export default {
  name: 'Shiritori',
  data: function() {
    return {
      message: '',
      lost: false,
      playing: false,
      inputWord: '',
      playedWords: [],
      playerName: '',
      score: 0,
      errorMessage: '',
    };
  },
  methods: {
    handleSubmit: function(e) {
      e.preventDefault();
      if (this.lost) {
        return;
      }
      this.playing = true;
      apiService.playWord({
        playerName: this.playerName,
        inputWord: this.inputWord,
      })
        .then((resp) => {
          if (resp.valid) {
            this.showValidMessage();
          } else {
            this.endGame();
          }
          this.refreshWordList();
        });
    },
    handleNameChange: function() {
      this.refreshWordList();
    },
    startGame: function() {
      this.lost = false;
    },
    endGame: function() {
      this.lost = true;
    },
    setScore: function(score) {
      this.score = score;
    },
    resetMessageDelayed: function() {
      setTimeout(() => {
        this.message = '';
      }, 2500);
    },
    showValidMessage: function() {
      this.message = 'Nicely done.';
      this.resetMessageDelayed();
    },
    refreshWordList: function() {
      apiService.fetchUsedWords({ playerName: this.playerName })
        .then((data) => {
          const {
            words,
            message,
            gameOver,
          } = data;
          if (gameOver) {
            this.endGame();
          } else {
            this.startGame();
          }
          if (words) {
            this.playedWords = words.reverse();
            this.setScore(words.length);
            this.errorMessage = '';
          } else if (message === 'invalid player name') {
            this.errorMessage = 'Please enter a player name';
          } else {
            this.errorMessage = message;
          }
        });
    },
    reset: function() {
      apiService.resetGame({ playerName: this.playerName })
        .then((resp) => {
          if (resp) {
            this.message = '';
            this.inputWord = '';
            this.playedWords = [];
            this.playerName = '';
            this.score = 0;
            this.startGame();
          } else {
            this.endGame();
          }
        })
        .catch((error) => {
          console.error('error', error.message);
          this.lost = false;
          this.message = '';
          this.inputWord = '';
          this.playedWords = [];
          this.playerName = '';
          this.score = 0;
          this.startGame();
        });
    },
  },
  mounted: function() {
    this.refreshWordList();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.play-word form {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.play-word form * {
  margin: 5px;
}

.gameover-message {
  color: red;
}

.error-message {
  color: red;
}

.word-input {
  width: 300px;
  font-size: 28px;
  display: block;
}

.used-words ul {
  margin: 20px;
  padding: 0;
}

.used-words li {
  display: block;
}

.message {
  color: green;
}

.message.valid {
  color: green;
}

.message.invalid {
  color: red;
}
</style>
