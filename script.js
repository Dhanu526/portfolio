const revealItems = document.querySelectorAll('.reveal');
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('main section[id]');
const contactForm = document.getElementById('contactForm');
const particlesCanvas = document.getElementById('particlesCanvas');
const networkCanvas = document.getElementById('networkCanvas');
const matrixCanvas = document.getElementById('matrixCanvas');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.2,
  }
);

revealItems.forEach((item, index) => {
  item.style.transitionDelay = `${index * 70}ms`;
  revealObserver.observe(item);
});

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const id = entry.target.getAttribute('id');
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('active', active);
      });
    });
  },
  {
    threshold: 0.45,
  }
);

sections.forEach((section) => navObserver.observe(section));

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = data.get('name')?.toString().trim() || '';
    const email = data.get('email')?.toString().trim() || '';
    const message = data.get('message')?.toString().trim() || '';

    const subject = encodeURIComponent(`Hiring message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=pujaladhanu@gmail.com&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  });
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const allowHeavyFx = window.innerWidth > 768;

if (!prefersReducedMotion && allowHeavyFx && particlesCanvas && networkCanvas && matrixCanvas) {
  const pCtx = particlesCanvas.getContext('2d');
  const nCtx = networkCanvas.getContext('2d');
  const mCtx = matrixCanvas.getContext('2d');

  const particles = [];
  const nodes = [];
  let matrixDrops = [];
  const matrixChars = '01[]{}<>/\\';
  const mouse = {
    x: -1000,
    y: -1000,
    active: false,
  };

  const repulse = (point, radius, forceScale) => {
    const dx = point.x - mouse.x;
    const dy = point.y - mouse.y;
    const dist = Math.hypot(dx, dy);
    if (!mouse.active || dist === 0 || dist > radius) {
      return;
    }

    const force = (1 - dist / radius) * forceScale;
    point.vx += (dx / dist) * force;
    point.vy += (dy / dist) * force;
  };

  const resizeFx = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    [particlesCanvas, networkCanvas, matrixCanvas].forEach((canvas) => {
      canvas.width = width;
      canvas.height = height;
    });

    particles.length = 0;
    const particleCount = Math.min(160, Math.floor(width / 10));
    for (let i = 0; i < particleCount; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.6,
      });
    }

    nodes.length = 0;
    const nodeCount = Math.min(46, Math.floor(width / 34));
    for (let i = 0; i < nodeCount; i += 1) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
      });
    }

    const columns = Math.floor(width / 18);
    matrixDrops = Array.from({ length: columns }, () => Math.random() * height);
  };

  const drawParticles = () => {
    pCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
    pCtx.fillStyle = 'rgba(38, 56, 84, 0.35)';
    particles.forEach((p) => {
      repulse(p, 150, 0.09);
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.985;
      p.vy *= 0.985;
      if (p.x < -4 || p.x > particlesCanvas.width + 4) p.vx *= -1;
      if (p.y < -4 || p.y > particlesCanvas.height + 4) p.vy *= -1;
      pCtx.beginPath();
      pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pCtx.fill();
    });
  };

  const drawNetwork = () => {
    nCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);
    nCtx.strokeStyle = 'rgba(18, 84, 98, 0.2)';
    nCtx.fillStyle = 'rgba(255, 106, 0, 0.3)';

    nodes.forEach((node) => {
      repulse(node, 190, 0.14);
      node.x += node.vx;
      node.y += node.vy;
      node.vx *= 0.988;
      node.vy *= 0.988;
      if (node.x < 0 || node.x > networkCanvas.width) node.vx *= -1;
      if (node.y < 0 || node.y > networkCanvas.height) node.vy *= -1;
    });

    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 160) {
          nCtx.globalAlpha = 1 - dist / 160;
          nCtx.beginPath();
          nCtx.moveTo(nodes[i].x, nodes[i].y);
          nCtx.lineTo(nodes[j].x, nodes[j].y);
          nCtx.stroke();
        }
      }
    }

    nCtx.globalAlpha = 1;
    nodes.forEach((node) => {
      nCtx.beginPath();
      nCtx.arc(node.x, node.y, 2, 0, Math.PI * 2);
      nCtx.fill();
    });
  };

  let matrixTicker = 0;
  const drawMatrix = () => {
    matrixTicker += 1;
    if (matrixTicker % 2 !== 0) return;
    const { width, height } = matrixCanvas;
    mCtx.fillStyle = 'rgba(240, 234, 223, 0.06)';
    mCtx.fillRect(0, 0, width, height);
    mCtx.fillStyle = 'rgba(28, 85, 73, 0.26)';
    mCtx.font = '12px Consolas, monospace';

    matrixDrops.forEach((drop, idx) => {
      const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      const x = idx * 18;
      mCtx.fillText(text, x, drop);
      matrixDrops[idx] += 10;
      if (matrixDrops[idx] > height + Math.random() * 120) {
        matrixDrops[idx] = -10;
      }
    });
  };

  const animateFx = () => {
    drawParticles();
    drawNetwork();
    drawMatrix();
    requestAnimationFrame(animateFx);
  };

  resizeFx();
  window.addEventListener('resize', resizeFx);
  window.addEventListener('mousemove', (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.active = true;
  });
  window.addEventListener('mouseleave', () => {
    mouse.active = false;
    mouse.x = -1000;
    mouse.y = -1000;
  });
  animateFx();
}

document.getElementById('year').textContent = new Date().getFullYear();
