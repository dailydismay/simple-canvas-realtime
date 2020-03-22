const main = () => {
  const wsConn = new WebSocket(window.location.href.replace('http', 'ws'));
  const send = obj => wsConn.send(JSON.stringify(obj));

  let pressed = false;
  let lastX, lastY;

  const canvas = document.querySelector('canvas');

  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const setUnpressed = () => (pressed = false);

  const getCords = e => {
    const { pageX, pageY } = e;
    const { offsetLeft, offsetTop } = canvas;

    const x = pageX - offsetLeft;
    const y = pageY - offsetTop;

    return { x, y };
  };

  const draw = ({ x, y }, down = true) => {
    if (down) {
      ctx.beginPath();
      ctx.strokeStyle = '#FFC0CB';
      ctx.lineWidth = 15;
      ctx.lineJoin = 'round';
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.stroke();
    }
    lastX = x;
    lastY = y;
  };

  wsConn.onmessage = ({ data }) => {
    draw(JSON.parse(data));
  };

  canvas.onmouseleave = setUnpressed;
  canvas.onmouseup = setUnpressed;

  canvas.onmousedown = e => {
    pressed = true;
    const cords = getCords(e);
    send(cords);
    draw(cords, false);
  };

  canvas.onmousemove = e => {
    if (pressed) {
      const cords = getCords(e);
      send(cords);
      draw(cords);
    }
  };
};
