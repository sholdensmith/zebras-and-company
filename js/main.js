/* Nav state, scroll spy, reveal-on-entry. No dependencies. */
(function () {
  'use strict';

  var nav = document.querySelector('[data-nav]');
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-nav-link]'));
  var current = document.querySelector('[data-current]');
  var toggle = document.querySelector('[data-nav-toggle]');
  var stops = links.map(function (a) { return document.getElementById(a.getAttribute('data-nav-link')); }).filter(Boolean);

  /* Mobile: open and close the card */
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    links.forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
      });
    });
  }

  /* Scroll spy: the stop whose top is nearest above the middle of the viewport */
  function setActive(id) {
    links.forEach(function (a) {
      var on = a.getAttribute('data-nav-link') === id;
      a.classList.toggle('is-active', on);
      if (on) {
        a.setAttribute('aria-current', 'location');
        if (current) current.textContent = a.querySelector('.nav-card__word').textContent;
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }
  var ticking = false;
  function spy() {
    ticking = false;
    var mid = window.innerHeight * 0.4;
    var active = null;
    for (var i = 0; i < stops.length; i++) {
      var r = stops[i].getBoundingClientRect();
      if (r.top <= mid) active = stops[i].id;
    }
    if (active) setActive(active);
    else {
      links.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
      if (current) current.textContent = current.getAttribute('data-default');
    }
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(spy); }
  }, { passive: true });
  spy();

  /* Reveal on entry */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }
})();
