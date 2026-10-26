/* Sidebar state, scroll spy, reveal-on-entry. No dependencies. */
(function () {
  'use strict';

  /* ?drafts in the URL shows the DRAFT markers on connective prose */
  if (/[?&]drafts\b/.test(window.location.search) || window.location.hash === '#drafts') {
    document.documentElement.classList.add('show-drafts');
  }

  var nav = document.querySelector('[data-nav]');
  var links = Array.prototype.slice.call(document.querySelectorAll('[data-nav-link]'));
  var current = document.querySelector('[data-current]');
  var toggle = document.querySelector('[data-nav-toggle]');
  var stops = links.map(function (a) { return document.getElementById(a.getAttribute('data-nav-link')); }).filter(Boolean);

  /* Narrow screens: the bar opens and closes the list */
  function close() {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.textContent = 'Menu';
    document.body.style.overflow = '';
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
      document.body.style.overflow = open ? 'hidden' : '';
    });
    links.forEach(function (a) { a.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* Scroll spy: the stop whose top is nearest above the upper part of the viewport */
  function setActive(id) {
    links.forEach(function (a) {
      var on = a.getAttribute('data-nav-link') === id;
      a.classList.toggle('is-active', on);
      if (on) {
        a.setAttribute('aria-current', 'location');
        if (current) current.textContent = a.querySelector('.sidebar__word').textContent;
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
