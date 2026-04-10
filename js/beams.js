/* Beams Background — vanilla JS adaptation (optimised) */
(function () {
  var isMobile = window.innerWidth < 768;
  var BEAM_COUNT = isMobile ? 10 : 20;

  function createBeam(w, h) {
    return {
      x: Math.random() * w * 1.5 - w * 0.25,
      y: Math.random() * h * 1.5 - h * 0.25,
      width: 30 + Math.random() * 60,
      length: h * 2.5,
      angle: -35 + Math.random() * 10,
      speed: 0.4 + Math.random() * 0.8,
      opacity: 0.14 + Math.random() * 0.12,
      hue: 210 + Math.random() * 40,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.015 + Math.random() * 0.02,
    };
  }

  function resetBeam(beam, index, w, h) {
    var col = index % 3;
    var spacing = w / 3;
    beam.y = h + 100;
    beam.x = col * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
    beam.width = 80 + Math.random() * 80;
    beam.speed = 0.3 + Math.random() * 0.3;
    beam.hue = 210 + (index * 40) / BEAM_COUNT;
    beam.opacity = 0.14 + Math.random() * 0.10;
    return beam;
  }

  function initBeams(canvas) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var beams = [];
    var raf = 0;
    var cw = 0;
    var ch = 0;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      cw = rect.width;
      ch = rect.height;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = cw + "px";
      canvas.style.height = ch + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      beams = [];
      for (var i = 0; i < BEAM_COUNT; i++) {
        beams.push(createBeam(cw, ch));
      }
    }

    resize();
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 200);
    });

    function animate() {
      ctx.clearRect(0, 0, cw, ch);
      ctx.filter = "blur(35px)";

      for (var i = 0; i < beams.length; i++) {
        var b = beams[i];
        b.y -= b.speed;
        b.pulse += b.pulseSpeed;
        if (b.y + b.length < -100) {
          resetBeam(b, i, cw, ch);
        }

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.rotate((b.angle * Math.PI) / 180);

        var pulsing = b.opacity * (0.8 + Math.sin(b.pulse) * 0.2);
        var grad = ctx.createLinearGradient(0, 0, 0, b.length);
        var h = b.hue;

        grad.addColorStop(0, "hsla(" + h + ",70%,60%,0)");
        grad.addColorStop(0.1, "hsla(" + h + ",70%,60%," + pulsing * 0.5 + ")");
        grad.addColorStop(0.4, "hsla(" + h + ",70%,60%," + pulsing + ")");
        grad.addColorStop(0.6, "hsla(" + h + ",70%,60%," + pulsing + ")");
        grad.addColorStop(0.9, "hsla(" + h + ",70%,60%," + pulsing * 0.5 + ")");
        grad.addColorStop(1, "hsla(" + h + ",70%,60%,0)");

        ctx.fillStyle = grad;
        ctx.fillRect(-b.width / 2, 0, b.width, b.length);
        ctx.restore();
      }

      raf = requestAnimationFrame(animate);
    }

    /* Only animate when visible */
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (!raf) raf = requestAnimationFrame(animate);
          } else {
            if (raf) { cancelAnimationFrame(raf); raf = 0; }
          }
        });
      },
      { threshold: 0 }
    );
    observer.observe(canvas.parentElement);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".beams-canvas").forEach(function (c) {
      initBeams(c);
    });
  });
})();
