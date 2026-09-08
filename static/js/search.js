/**
 * Site search, backed by Pagefind.
 *
 * Pagefind indexes the built HTML after `zola build`, so there is no index to
 * maintain in the source tree and nothing is downloaded until someone actually
 * searches: the bundle and its shards load on first open, not on page load.
 *
 * Ported from the implementation in terraphim/md-book, trimmed to this site.
 * The generation counter is the part worth keeping: `debouncedSearch` resolves
 * out of order under fast typing, so a slow early query can otherwise overwrite
 * the results of a later one.
 */
(function () {
  'use strict';

  var MIN_QUERY = 2;
  var MAX_RESULTS = 20;
  var DEBOUNCE_MS = 150;

  var pagefind = null;
  var initFailed = false;
  var generation = 0;

  var modal = document.getElementById('search-modal');
  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  var status = document.getElementById('search-status');
  if (!modal || !input || !results) return;

  var lastFocused = null;

  function open() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    // Focus on the next frame: focusing an element in the same tick it stops
    // being [hidden] is unreliable, since it is not yet laid out.
    requestAnimationFrame(function () {
      input.focus();
      input.select();
    });
    init();
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  async function init() {
    if (pagefind || initFailed) return;
    try {
      pagefind = await import('/pagefind/pagefind.js');
      await pagefind.options({ basePath: '/pagefind/' });
      await pagefind.init();
    } catch (e) {
      initFailed = true;
      setStatus('Search is unavailable on this build.');
    }
  }

  function setStatus(text) {
    if (status) status.textContent = text;
  }

  function render(query, items, total) {
    results.innerHTML = '';

    if (query.length < MIN_QUERY) {
      setStatus('Type at least ' + MIN_QUERY + ' characters.');
      return;
    }
    if (!items.length) {
      setStatus('No results for "' + query + '".');
      return;
    }

    setStatus(total + (total === 1 ? ' result' : ' results'));

    items.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'search-result';

      var a = document.createElement('a');
      a.className = 'search-result-link';
      a.href = item.url;

      var h = document.createElement('span');
      h.className = 'search-result-title';
      h.textContent = item.title;
      a.appendChild(h);

      if (item.excerpt) {
        var p = document.createElement('p');
        p.className = 'search-result-excerpt';
        // Pagefind returns the excerpt with <mark> around the matched terms.
        p.innerHTML = item.excerpt;
        a.appendChild(p);
      }

      var u = document.createElement('span');
      u.className = 'search-result-url';
      u.textContent = item.url;
      a.appendChild(u);

      li.appendChild(a);
      results.appendChild(li);
    });
  }

  async function run(query) {
    var mine = ++generation;
    query = query.trim();

    if (query.length < MIN_QUERY) {
      render(query, [], 0);
      return;
    }

    await init();
    if (!pagefind) return;

    try {
      var search = await pagefind.debouncedSearch(query, {}, DEBOUNCE_MS);
      // null means a newer keystroke superseded this call before it ran.
      if (search === null || mine !== generation) return;

      var items = await Promise.all(
        search.results.slice(0, MAX_RESULTS).map(async function (r) {
          var d = await r.data();
          return {
            url: d.url,
            title: (d.meta && d.meta.title) || d.url,
            excerpt: d.excerpt
          };
        })
      );
      // The awaits above can also resolve late.
      if (mine !== generation) return;

      render(query, items, search.results.length);
    } catch (e) {
      if (mine !== generation) return;
      setStatus('Search failed. Try again.');
    }
  }

  /* ---- Wiring ---- */

  input.addEventListener('input', function () { run(input.value); });

  Array.prototype.forEach.call(document.querySelectorAll('[data-search-open]'), function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); open(); });
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.hasAttribute('data-search-close')) close();
  });

  document.addEventListener('keydown', function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName) ||
                 document.activeElement.isContentEditable;

    if (!modal.hidden && e.key === 'Escape') { close(); return; }

    if (modal.hidden && !typing && (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key === 'k'))) {
      e.preventDefault();
      open();
      return;
    }

    if (modal.hidden) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      var links = results.querySelectorAll('.search-result-link');
      if (!links.length) return;
      e.preventDefault();
      var i = Array.prototype.indexOf.call(links, document.activeElement);
      var next = e.key === 'ArrowDown' ? i + 1 : i - 1;
      if (next < 0) { input.focus(); return; }
      if (next >= links.length) next = links.length - 1;
      links[next].focus();
    }
  });
})();
