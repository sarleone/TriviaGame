
function Timer(gameLength) {
  this.timeLeft = gameLength;
  this.done = null;
  this.reset = function() { 
    clearInterval(timer); 
    this.timeLeft = 0;
    document.querySelector("#timer").innerHTML = this.render();
  };
  this.render = function() {
    return "<div>Time Left: " + this.timeLeft + "</div><br>";
  };

  var that = this;
  var countdown = function() {
    that.timeLeft--;
    document.querySelector("#timer").innerHTML = that.render();
    if (that.timeLeft === 0) {  // game over
      that.reset();
      that.done = true;
      document.dispatchEvent(new Event('timerDone'));
    }
  };
  var timer = setInterval(countdown, 1000);
}
struct = {
	  "What percentage of the earth's water is held in soil?": {
	    "choices": [
	      "0.1",
	      ".15",
	      ".20",
	    ],
	    "answer": "0.1"
	  },
	  "How many tons of dry soil per acre pass through one earthworm each year?": {
	    "choices": [
	      "5",
	      "10",
	      "15",
	    ],
	    "answer": "5"
	  },
	  "What are the minimum number of years it takes to form one inch of topsoil?": {
	    "choices": [
	      "250",
	      "500",
	      "1,000",
	    ],
	    "answer": "500"
	  },
	    "What percentage of the world's carbon dioxide emmisions are stored in soil?": {
	    "choices": [
	      "10",
	      "15",
	      "20",
	    ],
	    "answer": "10"
	  },
	    "True or False: 1 Tablespoon of soil has more organisms in it than people on earth.": {
	    "choices": [
	      "True",
	      "False",
	    ],
	    "answer": "True"
	  },
	    "How many gallons of water does it take to produce one bushel of corn?": {
	    "choices": [
	      "2,000",
	      "4,000",
	      "6,000",
	    ],
	    "answer": "4,000"
	  },
	    "How many gallons of water does it take to produce one bushel of wheat?": {
	    "choices": [
	      "7,000",
	      "9,000",
	      "11,000",
	    ],
	    "answer": "11,000"
	  },
	    "True or False: Half of the topsoil on the planet has been lost in the last 150 years.": {
	    "choices": [
	      "True",
	      "False",
	    ],
	    "answer": "True"
	  }
	};
function Answer(content, name) {
  this.content = content || "";
  this.name = name;
  this.render = function() {
    return "<input type=radio name=" + this.name  + " value='" + this.content + "'>" + "&nbsp;" + this.content + "<br>";
  };
}

function Question(content, choices) {
  this.id = generateUniqueId("question");
  this.content = content;
  this.answeredCorrectly = null;  
  this.serialize = function() {
    var answerID = this.id + "-answer";
    var selectedAnswer = document.querySelector("#" + this.id).elements[answerID].value;
    var result = {}; result[this.content] = {"answer": selectedAnswer, "id": this.id};
    return result;
  };
  this.disableAnswering = function() {
    var radioButtons = document.querySelectorAll("input[name=" + this.id + "-answer]");
    radioButtons.forEach(function(radioButton) { radioButton.disabled = true; });
  };
  this.render = function() {
    var inputs = this.answers.map(function(answer) { return answer.render(); });
    return "<form id=" + this.id + ">" +
             this.content + "<br>" + 
             inputs.join("") + 
           "</form>";
  };
  var that = this;
  this.answers = choices.map(function(choice) { return new Answer(choice, that.id + "-answer"); });
}



function Trivia(gameLength) {

  this.timer = new Timer(gameLength);
  this.questions = Object.keys(struct).map(function(question) {
    var choices = struct[question].choices;
    return new Question(question, choices);
  }); 
  this.serialize = function() {
    var serializedQuestions = this.questions.map(function(question) { return question.serialize(); });
    return serializedQuestions.reduce(function(acc, obj) {
      for (var key in obj) { acc[key] = obj[key].answer; }
      return acc;
    }, {});
  };
  this.disableAllAnswering = function() {
    this.questions.forEach(function(question, index) { question.disableAnswering(); });
    document.querySelector("#questions button").disabled = true;
  };
  this.checkUserAnswers = function() {
    var questions = that.questions;
    var rubric = getRubric();
    var userAnswers = questions.map(function(question) { 
      return question.serialize(); 
    }).reduce(function(acc, obj) {
      for (var key in obj) { acc[key] = obj[key]; }
      return acc;
    }, {});
    Object.keys(rubric).forEach(function(key, index) {
      question = questions.filter(function(question) { return question.id == userAnswers[key].id; }).pop();
      if (rubric[key] == userAnswers[key].answer) {  // win condition
        question.answeredCorrectly = true;
      } else if (userAnswers[key].answer !== "") {
        question.answeredCorrectly = false;
      }
    });
    return questions.map(function(question) { return question.answeredCorrectly; });
  };
  this.calculateScore = function() {
    // Do something more fancy in the future
    return this.correct();
  };
  this.correct = function() {
    return this.questions.filter(function(question) { return question.answeredCorrectly === true; }).length;
  };
  this.incorrect = function() {
    return this.questions.filter(function(question) { return question.answeredCorrectly === false; }).length;
  };
  this.unanswered = function() {
    return this.questions.filter(function(question) { return question.answeredCorrectly === null; }).length;
  };
  this.render = function() {
    var serialize = this.serialize;
    var forms = this.questions.map(function(question) { return question.render(); });
    return "<div id=questions>" + 
             forms.join("<br>") + 
             "<br><button>" + "Final Answer" + "</button>" +
           "</div>";
  };

  var that = this;
  var getRubric = function() {
    var result = {};
    Object.keys(struct).forEach(function(key, index) {
      result[key] = struct[key].answer;
    });
    return result;
  };
  var gameOver = function() {
    that.timer.reset();
    that.checkUserAnswers();
    that.disableAllAnswering();
    console.log(that.serialize(), that.calculateScore());
    alert(
      "Correct: " + that.correct() + "\n" +
      "Incorrect: " + that.incorrect() + "\n" +
      "Unanswered: " + that.unanswered() 
    );
  };

  document.addEventListener("DOMContentLoaded", function() {
    document.querySelector("#timer").innerHTML = that.timer.render();
    document.querySelector("#trivia").innerHTML = that.render();
    document.querySelector("#questions button").onclick = gameOver;  // game over
  });
  document.addEventListener("timerDone", gameOver);
}

var generateUniqueId = function(prefix) {
  if (prefix === undefined) {
    return Math.random().toString(36).substr(2, 16);
  } else {
    return prefix + "-" + Math.random().toString(36).substr(2, 16);
  }
};
var trivia = new Trivia(10);
// $(document).ready(function(){
//     $("startGame").click(function(){
//         $("trivia").load(new Trivia(10));
//     });
// });



