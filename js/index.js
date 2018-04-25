//variables
var game = {};
var boardSound = [
  "https://s3.amazonaws.com/freecodecamp/simonSound1.mp3", //green
  "https://s3.amazonaws.com/freecodecamp/simonSound2.mp3", //red
  "https://s3.amazonaws.com/freecodecamp/simonSound3.mp3", //yellow
  "https://s3.amazonaws.com/freecodecamp/simonSound4.mp3", //blue
  "http://soundbible.com/mp3/efx_NO-Fabio_Farinelli-955789468.mp3", // error
  "http://soundbible.com/mp3/Sad_Trombone-Joe_Lamb-665429450.mp3", //end
  "http://soundbible.com/mp3/1_person_cheering-Jett_Rifkin-1851518140.mp3" //win
];

$(document).ready(function(){
  /* ***************** reset game data *********************** */
  game.reset = function() {
    game.initialize();
    this.strict = false;
  }
  /* initialize  */
  game.initialize = function() {
    reGainHearts();
    this.life = 5;
    this.sequence = [];
    this.level = 0;
    this.userIndex = 0;
    this.lock = false;
  }
  /* clear time out */
  function clearTimer() {
    clearTimeout(game.toHdl);
    clearTimeout(game.toHdlfl);
    clearTimeout(game.toHdlst);
    clearInterval(game.seqHdl);
    clearInterval(game.flHdl);
    clearInterval(game.brHdl);
  }
  /* game started */
  function gameStart(){
    clearTimer();
    game.initialize();
    addLevel();
    $(".count").removeClass("led-off");
    padLightOff();
    displayFlash("GL");
  }
  // restore life
  function reGainHearts() {
    var i = 0;
      game.heartIntvl = setInterval(function(){
        i++;
        $("#life"+i+" #heart1").removeClass('emptyHeart');
        if (i == 5) clearInterval(game.heartIntvl);
      }, 100);
  }
  
  /* *******************   pad light control  ************************/
  /* pad light on */
  function padLightOn(id) {
    game.curPad = $("#" + id);
    $("#" + id).addClass("light")
  }
  /* pad light off  */
  function padLightOff() {
    if (game.curPad) game.curPad.removeClass("light");
    game.curPad = undefined;
  }
  /* **************************   audio control  ***************************/
  /* play audio  */
  function playSound(id) {
    var sound = new Audio(boardSound[id]);
    sound.play();
  }
  
  /* ****************************** warning control **************************/
  /* error warning  */
  function errorWarning(padObj) {
    clearTimer();
    game.lock = true; 
    $('.pad').removeClass('clickable').addClass('unclickable');
    if(game.strict){
      game.life = 0;
      $("#life1 #heart1").addClass('emptyHeart');
      $("#life2 #heart1").addClass('emptyHeart');
      $("#life3 #heart1").addClass('emptyHeart');
      $("#life4 #heart1").addClass('emptyHeart');
      $("#life5 #heart1").addClass('emptyHeart');
    } else{
      $("#life"+game.life+" #heart1").addClass('emptyHeart');
      game.life--;
    }
    if (game.life == 0){
      playSound(5);
      if(padObj) padObj.addClass('light');
      game.toHdl = setTimeout(function() {
        if (padObj) padObj.removeClass("light");
      },1000); 
      displayFlash(':(');
    } else {
      playSound(4);    
      if(padObj) padObj.addClass('light');
      game.toHdl = setTimeout(function() {
        if (padObj) padObj.removeClass("light");
        game.toHdlst = setTimeout(function() {
          playSequence();
        },1000);
      },1000); 
      displayFlash("NO!");
    }
  }

  
  /*   display flash  */
  function displayFlash(msg) {
    $(".count").text(msg);
    //make display flash once
    var flash = function() {
      $(".count").addClass("led-off");
      game.toHdlfl = setTimeout(function(){
        $(".count").removeClass("led-off");
      },250);
    }
    // flash 3 times
    var i = 0;
    game.flHdl = setInterval(function(){
      flash();
      i++;
      if (i == 2) clearInterval(game.flHdl);
    },500);
  }
  
  /*  notify win  */
  function winWarning() {
    displayFlash("WIN!");
    var i = 0;
    game.seqHdl = setInterval(function(){
      padLightOn(i % 4);
      game.toHdl = setTimeout(function(){
        padLightOff();
      },100);
      i++;
    },200);
    playSound(6);
  }
  
  /* ************************** game mechanism ******************* */
  function playSequence() {
    var i = 0;
    game.seqHdl = setInterval(function(){
      // pad light on and play sound
      padLightOn(game.sequence[i]);
      playSound(game.sequence[i]);
      // display level
      displayCount();
      game.lock = true;
      i++;
      // pad light off
      game.toHdl = setTimeout(function(){
        padLightOff();
      }, game.step / 2 - 10);
      if (i == game.sequence.length) {
        // user's turn start
        game.userIndex = 0;
        // done playing
        clearInterval(game.seqHdl);
        game.lock = false;
        // allow user input
        $(".pad").removeClass("unclickable").addClass("clickable");
        // time out show error
        game.toHdl = setTimeout(function(){
          errorWarning();
        }, 5 * game.step);
      }
    },game.step);
  }
  
  /*  add a new step  */
  function addLevel() {
    game.sequence.push(Math.floor(Math.random() * 4));
    game.step = setStep(game.level);
    game.level++;
    game.toHdl = setTimeout(function(){
      playSequence();
    },500);
  }
  
  /* set sound-play step based on level */
  function setStep(lv) {
    game.steps = [1250, 1000, 750, 500];
    if (lv < 4) return game.steps[0];
    else if (lv < 8) return game.steps[1];
    else if (lv < 12) return game.steps[2];
    else return game.steps[3];
  }
 
  /* add a prefix 0 to level < 10 */
  function displayCount() {
    if (game.level < 10) $(".count").text("0" + game.level);
    else $(".count").text(game.level);
  }

/* ******************** user input ******************* */
function userSequence(padObj) {
  if (!game.lock) {
    clearTimeout(game.toHdl);
    var id = padObj.attr("id");
    // correct input
    if (id == game.sequence[game.userIndex]) {
      playSound(id);
      padLightOn(id);
      game.userIndex++;
      // win!
      if (game.userIndex == 20) {
        game.lock = true;
        $(".pad").removeClass("clickable").addClass("unclickable");
        game.toHdl = setTimeout(function(){
          winWarning();
        },1000);
      }
      // not win yet
      // user not done yet, keep doing
      else if (game.userIndex < game.sequence.length) {
        game.toHdl = setTimeout(function(){
          errorWarning(padObj);
        }, 5 * game.step);
      }
      else {
        // user done, continue game sequence
        $(".pad").removeClass("clickable").addClass("unclickable");
        addLevel();
      }
    }
    // incorrect input
    else {
        errorWarning(padObj);
    }
  }
}
/* **************** board control ***************** */
  // user press down mouse on a pad
 $(".pad").mousedown(function(){
   userSequence($(this));
 }); 
  // user release mouse
  $("*").mouseup(function(){
    if (!game.lock) padLightOff();
  });
  // toggle strict
  function toggleStrict() {
    $("#mod-led").toggleClass("led-on");
    game.strict = !game.strict;
  }
  
  // game main switch  
  $(".outer-switch").click(function(){
    $("#sw").toggleClass("switch-on");
    if ($("#sw").hasClass("switch-on")) {
      $(".count").removeClass("led-off");
      $("#startBtn").removeClass("unclickable").addClass("clickable");
      $("#strictBtn").removeClass("unclickable").addClass("clickable");
    }
    else {
      game.reset();
      clearTimer();
      padLightOff();
      $(".count").text("--").addClass("led-off");
      $("#mod-led").removeClass("led-on");
      $("#startBtn").removeClass("clickable").addClass("unclickable");
      $("#strictBtn").removeClass("clickable").addClass("unclickable");
      $(".pad").removeClass("clickable").addClass("unclickable");
    }
  });
  $("#startBtn").click(function(){
    gameStart();
    console.log("start clicked");
  });
  $("#strictBtn").click(function(){
    console.log("strict toggled");
    toggleStrict();
  });
  game.reset();
});