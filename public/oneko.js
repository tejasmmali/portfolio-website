// oneko.js: https://github.com/adryd325/oneko.js
// Sleeps perched on the photo (not an overlay), wakes on scroll, then follows.

(function oneko() {
  const isReducedMotion =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;

  if (isReducedMotion) return;

  const nekoEl = document.createElement("div");

  let nekoPosX = 32;
  let nekoPosY = 32;

  let mousePosX = 0;
  let mousePosY = 0;

  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;

  const nekoSpeed = 10;
  let active = false;

  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    scratchWallN: [
      [0, 0],
      [0, -1],
    ],
    scratchWallS: [
      [-7, -1],
      [-6, -2],
    ],
    scratchWallE: [
      [-2, -2],
      [-2, -3],
    ],
    scratchWallW: [
      [-4, 0],
      [-4, -1],
    ],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };

  function seatHost() {
    return (
      document.querySelector("[data-oneko-seat]") ||
      document.querySelector("[data-oneko-spawn]")
    );
  }

  function perchOnPhoto() {
    const host = seatHost();
    if (!host) return false;

    if (nekoEl.parentElement !== host) {
      host.appendChild(nekoEl);
    }

    nekoEl.style.position = "absolute";
    nekoEl.style.left = "50%";
    nekoEl.style.top = "-28px";
    nekoEl.style.transform = "translateX(-50%)";
    nekoEl.style.zIndex = "1";

    const rect = host.getBoundingClientRect();
    nekoPosX = rect.left + rect.width / 2;
    nekoPosY = rect.top - 12;
    mousePosX = nekoPosX;
    mousePosY = nekoPosY;
    return true;
  }

  function goFixed() {
    const rect = nekoEl.getBoundingClientRect();
    nekoPosX = rect.left + 16;
    nekoPosY = rect.top + 16;
    mousePosX = nekoPosX;
    mousePosY = nekoPosY;

    document.body.appendChild(nekoEl);
    nekoEl.style.position = "fixed";
    nekoEl.style.transform = "none";
    nekoEl.style.zIndex = "1";
    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
  }

  function init() {
    let nekoFile = "/oneko.gif";
    const curScript = document.currentScript;
    if (curScript && curScript.dataset.cat) {
      nekoFile = curScript.dataset.cat;
    }

    nekoEl.id = "oneko";
    nekoEl.ariaHidden = true;
    nekoEl.style.width = "32px";
    nekoEl.style.height = "32px";
    nekoEl.style.pointerEvents = "none";
    nekoEl.style.imageRendering = "pixelated";
    nekoEl.style.backgroundImage = `url(${nekoFile})`;

    idleAnimation = "sleeping";
    idleAnimationFrame = 8;
    setSprite("sleeping", 0);

    if (!perchOnPhoto()) {
      document.body.appendChild(nekoEl);
    }

    let tries = 0;
    const retry = () => {
      if (perchOnPhoto() || ++tries > 90) return;
      window.requestAnimationFrame(retry);
    };
    window.requestAnimationFrame(retry);

    document.addEventListener("mousemove", function (event) {
      if (!active) return;
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    });

    const wake = () => {
      if (active) return;
      active = true;
      goFixed();
      idleAnimation = null;
      idleAnimationFrame = 0;
      idleTime = 8;
      setSprite("alert", 0);
      window.removeEventListener("scroll", wake);
      document.removeEventListener("scroll", wake, true);
      window.removeEventListener("wheel", wake);
      window.removeEventListener("touchmove", wake);
    };

    window.addEventListener("scroll", wake, { passive: true });
    document.addEventListener("scroll", wake, { passive: true, capture: true });
    window.addEventListener("wheel", wake, { passive: true });
    window.addEventListener("touchmove", wake, { passive: true });

    window.requestAnimationFrame(onAnimationFrame);
  }

  let lastFrameTimestamp;

  function onAnimationFrame(timestamp) {
    if (!nekoEl.isConnected) {
      return;
    }
    if (!lastFrameTimestamp) {
      lastFrameTimestamp = timestamp;
    }
    if (timestamp - lastFrameTimestamp > 100) {
      lastFrameTimestamp = timestamp;
      frame();
    }
    window.requestAnimationFrame(onAnimationFrame);
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;

    if (
      idleTime > 10 &&
      Math.floor(Math.random() * 200) == 0 &&
      idleAnimation == null
    ) {
      let avalibleIdleAnimations = ["sleeping", "scratchSelf"];
      if (nekoPosX < 32) {
        avalibleIdleAnimations.push("scratchWallW");
      }
      if (nekoPosY < 32) {
        avalibleIdleAnimations.push("scratchWallN");
      }
      if (nekoPosX > window.innerWidth - 32) {
        avalibleIdleAnimations.push("scratchWallE");
      }
      if (nekoPosY > window.innerHeight - 32) {
        avalibleIdleAnimations.push("scratchWallS");
      }
      idleAnimation =
        avalibleIdleAnimations[
          Math.floor(Math.random() * avalibleIdleAnimations.length)
        ];
    }

    switch (idleAnimation) {
      case "sleeping":
        if (idleAnimationFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
        if (active && idleAnimationFrame > 192) {
          resetIdleAnimation();
        }
        break;
      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;
      default:
        setSprite("idle", 0);
        return;
    }
    idleAnimationFrame += 1;
  }

  function frame() {
    frameCount += 1;

    if (!active) {
      perchOnPhoto();
      idle();
      return;
    }

    const diffX = nekoPosX - mousePosX;
    const diffY = nekoPosY - mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || distance < 48) {
      idle();
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    if (idleTime > 1) {
      setSprite("alert", 0);
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    let direction;
    direction = diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, frameCount);

    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;

    nekoPosX = Math.min(Math.max(16, nekoPosX), window.innerWidth - 16);
    nekoPosY = Math.min(Math.max(16, nekoPosY), window.innerHeight - 16);

    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
  }

  init();
})();
