(function(timer, $, undefined) {
  var updaters = [];
  var interval;
  var delta;
  var time = 0;

  // Later on this can include information on the interval
  // so we don't update things every frame unless necessary
  timer.registerUpdater = function(updater) {
    updaters.push(
      {
        handler: updater
      }
    );
  }

  timer.pause = function() {
    if(interval) {
      clearInterval(interval);
    }
  }

  timer.setTime = function(new_time) {
    time = new_time;
  }

  timer.getTime = function() {
    return time;
  }

  timer.start = function(span) {
    delta = span;
    timer.pause();

    interval = setInterval(handleUpdaters, span);
  }

  function handleUpdaters() {
    time += delta;
    for(var i=0;i<updaters.length;i++) {
      updaters[i].handler(time);
    }
  }


}(window.timer = window.timer || {}, jQuery));
