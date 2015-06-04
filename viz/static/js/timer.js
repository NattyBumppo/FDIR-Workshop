(function(timer, $, undefined) {
  var updaters = [];
  var interval;
  var delta;
  var time = 0;

  timer.registerUpdater = function(updater, span) {
    updaters.push(
      {
        handler: updater,
        span: span,
        elapsed: span
      }
    );
  }

  timer.pause = function() {
    if(interval) {
      clearInterval(interval);
      interval = undefined;
    }
  }

  timer.isRunning = function() {
    return !!interval;// Explicit bool so as not to leak interval
  }

  timer.setTime = function(new_time) {
    time = new_time;

    // Set all things to update on next draw
    for(var i=0;i<updaters.length;i++) {
      updaters[i].elapsed = updater[i].span;
    }
  }

  timer.getTime = function() {
    return time;
  }

  timer.start = function(span) {
    delta = span;
    time = -span;

    timer.unpause();
  }

  timer.unpause = function() {
    timer.pause();
    interval = setInterval(handleUpdaters, delta);
  }

  function handleUpdaters() {
    time += delta;
    for(var i=0;i<updaters.length;i++) {
      updaters[i].elapsed += delta;

      if(updaters[i].elapsed >= updaters[i].span) {
        // Reset counter
        updaters[i].elapsed = 0;

        // Call the updater
        updaters[i].handler(time);
      }
    }
  }


}(window.timer = window.timer || {}, jQuery));
