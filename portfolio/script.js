document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.style.boxShadow = window.scrollY > 10 ? '0 4px 20px rgba(0,0,0,0.2)' : 'none';
});

// Highlight the current section's nav link while scrolling
window.addEventListener('scroll', () => {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = nav.querySelectorAll('a[href^="#"]');

  let current = '';
  sections.forEach((section) => {
    if (window.scrollY >= section.offsetTop - 200) {
      current = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
});

const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const subject = encodeURIComponent(`[${data.get('subject')}] Portfolio enquiry from ${data.get('name')}`);
  const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\n\n${data.get('message')}`);
  window.location.href = `mailto:sheetal@pskservices.co.in?subject=${subject}&body=${body}`;
  formNote.textContent = 'Opening your email client to send this message...';
});

// Testimonial carousel
class TestimonialCarousel {
  constructor(track) {
    this.track = track;
    this.currentSlide = 0;
    this.totalSlides = track.children.length;
    this.autoPlayInterval = null;

    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.indicators = document.querySelectorAll('.indicator');

    this.bindEvents();
    this.update();
    this.startAutoPlay();
  }

  bindEvents() {
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());

    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => this.goTo(index));
    });

    const section = document.querySelector('.testimonials');
    section?.addEventListener('mouseenter', () => this.stopAutoPlay());
    section?.addEventListener('mouseleave', () => this.startAutoPlay());

    let startX = 0;
    this.track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; });
    this.track.addEventListener('touchend', (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? this.next() : this.prev();
    });
  }

  update() {
    this.track.style.transform = `translateX(-${this.currentSlide * 100}%)`;
    this.indicators.forEach((indicator, index) => {
      indicator.classList.toggle('active', index === this.currentSlide);
    });
    if (this.prevBtn) this.prevBtn.disabled = this.currentSlide === 0;
    if (this.nextBtn) this.nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
  }

  next() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
    this.update();
    this.resetAutoPlay();
  }

  prev() {
    this.currentSlide = (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
    this.update();
    this.resetAutoPlay();
  }

  goTo(index) {
    this.currentSlide = index;
    this.update();
    this.resetAutoPlay();
  }

  startAutoPlay() {
    this.stopAutoPlay();
    this.autoPlayInterval = setInterval(() => this.next(), 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
  }

  resetAutoPlay() {
    this.startAutoPlay();
  }
}

const testimonialsTrack = document.querySelector('.testimonials-track');
if (testimonialsTrack) new TestimonialCarousel(testimonialsTrack);

// Animated stat counters
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const numEl = entry.target.querySelector('.stat-num');
    const target = parseInt(numEl.textContent, 10);
    const suffix = numEl.textContent.replace(/[0-9]/g, '');
    if (isNaN(target)) return;

    let current = 0;
    const step = Math.max(1, Math.round(target / 40));
    const tick = () => {
      current = Math.min(target, current + step);
      numEl.textContent = current + suffix;
      if (current < target) requestAnimationFrame(tick);
    };
    tick();
    statsObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat').forEach((stat) => statsObserver.observe(stat));
