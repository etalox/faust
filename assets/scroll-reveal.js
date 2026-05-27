/* ── Faust Partners Shared Scroll-Triggered Reveal Animation Engine ── */
(function() {
  window.faustInitScrollReveal = function(options) {
    options = options || {};

    // 1. Dynamic scroll speed calculation mapping to --reveal-duration
    var lastScroll = window.scrollY;
    var lastTime = Date.now();
    var scrollSpeed = 0;
    var scrollTimeout = null;

    function updateScrollSpeed() {
      var currentScroll = window.scrollY;
      var currentTime = Date.now();
      var deltaY = Math.abs(currentScroll - lastScroll);
      var deltaTime = currentTime - lastTime;
      
      if (deltaTime > 0) {
        // Calculate speed in px/ms
        var instantSpeed = deltaY / deltaTime;
        // Apply EMA (exponential moving average) for smoothing
        scrollSpeed = scrollSpeed * 0.65 + instantSpeed * 0.35;
      }
      
      lastScroll = currentScroll;
      lastTime = currentTime;

      // Map scroll speed (0 to 3.5 px/ms) to animation duration (1.6s down to 0.5s)
      var duration = 1.6 - Math.min(1.1, scrollSpeed / 3.2) * 1.0;
      document.documentElement.style.setProperty('--reveal-duration', duration.toFixed(2) + 's');

      // Reset speed to 0 when scrolling stops
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function() {
        scrollSpeed = 0;
        document.documentElement.style.setProperty('--reveal-duration', '1.6s');
      }, 150);
    }

    // Initialize default duration and listen for scroll
    document.documentElement.style.setProperty('--reveal-duration', '1.6s');
    window.addEventListener('scroll', updateScrollSpeed, { passive: true });

    // 2. Group adjacent text-like elements to force sequential reveal blocks
    var revealItems = document.querySelectorAll('.reveal-item');
    if (revealItems.length === 0) return;

    var groupIndex = 0;
    var currentGroup = [];
    var extraClasses = options.extraTextLikeClasses || [];

    revealItems.forEach(function(item) {
      var isTextLike = item.tagName === 'H1' || item.tagName === 'H2' || item.tagName === 'P' ||
                       item.classList.contains('pill') || item.classList.contains('btn-row') ||
                       item.classList.contains('logo-lockup') ||
                       extraClasses.some(function(cls) { return item.classList.contains(cls); });
                       
      if (isTextLike) {
        if (currentGroup.length > 0) {
          var lastItem = currentGroup[currentGroup.length - 1];
          if (lastItem.parentNode === item.parentNode) {
            currentGroup.push(item);
          } else {
            groupsPush(currentGroup);
            currentGroup = [item];
          }
        } else {
          currentGroup = [item];
        }
      } else {
        if (currentGroup.length > 0) {
          groupsPush(currentGroup);
          currentGroup = [];
        }
        groupsPush([item]);
      }
    });
    if (currentGroup.length > 0) {
      groupsPush(currentGroup);
    }

    function groupsPush(group) {
      groupIndex++;
      group.forEach(function(el) {
        el.setAttribute('data-reveal-group', 'rg-' + groupIndex);
      });
    }

    // 3. Bidirectional reveal observer (split into reveal and hide observers for cross-browser reliability)
    var revealObserverOptions = {
      root: null,
      rootMargin: '-120px 0px -180px 0px',
      threshold: 0.02
    };

    var revealObserver = new IntersectionObserver(function(entries) {
      var groupsToReveal = {};

      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var groupId = entry.target.getAttribute('data-reveal-group');
          groupsToReveal[groupId] = true;

          // Run hook for page-specific overrides (like rg-1 revealing .supported on landing)
          if (typeof options.onGroupIntersect === 'function') {
            options.onGroupIntersect(groupId, groupsToReveal);
          }
        }
      });

      // Resolve entering groups
      var enteringElements = [];
      Object.keys(groupsToReveal).forEach(function(groupId) {
        var groupElements = document.querySelectorAll('[data-reveal-group="' + groupId + '"]');
        groupElements.forEach(function(el) {
          if (!el.classList.contains('reveal-visible')) {
            enteringElements.push(el);
          }
        });
      });

      if (enteringElements.length > 0) {
        if (!document.body.classList.contains('is-ready')) {
          setTimeout(function() {
            var stillEntering = enteringElements.filter(function(el) {
              return !el.classList.contains('reveal-visible');
            });
            if (stillEntering.length > 0) {
              revealElements(stillEntering);
            }
          }, 550);
        } else {
          revealElements(enteringElements);
        }
      }
    }, revealObserverOptions);

    var hideObserverOptions = {
      root: null,
      rootMargin: '0px 0px 0px 0px',
      threshold: 0
    };

    var hideObserver = new IntersectionObserver(function(entries) {
      var groupsToHide = {};

      entries.forEach(function(entry) {
        if (!entry.isIntersecting) {
          var groupId = entry.target.getAttribute('data-reveal-group');
          groupsToHide[groupId] = true;
        }
      });

      Object.keys(groupsToHide).forEach(function(groupId) {
        var groupElements = Array.from(document.querySelectorAll('[data-reveal-group="' + groupId + '"]'));
        var isAnyVisible = groupElements.some(function(el) {
          var rect = el.getBoundingClientRect();
          return rect.bottom > 0 && rect.top < window.innerHeight;
        });
        
        if (!isAnyVisible) {
          var isBelowViewport = groupElements.every(function(el) {
            var rect = el.getBoundingClientRect();
            return rect.top >= window.innerHeight;
          });
          
          if (isBelowViewport) {
            groupElements.forEach(function(el) {
              el.classList.remove('reveal-visible');
              el.style.transitionDelay = '0ms';
            });
          }
        }
      });
    }, hideObserverOptions);

    function revealElements(elements) {
      elements.sort(function(a, b) {
        var rectA = a.getBoundingClientRect();
        var rectB = b.getBoundingClientRect();
        if (Math.abs(rectA.top - rectB.top) < 10) {
          return rectA.left - rectB.left;
        }
        return rectA.top - rectB.top;
      });

      var currentDelay = 0;
      var isHero = elements.length > 0 && elements[0].closest('.hero') !== null;
      var baseStagger = isHero ? 150 : 100;

      elements.forEach(function(el, index) {
        if (index > 0) {
          var prevEl = elements[index - 1];
          var isPrevHeader = prevEl.tagName === 'H1' || prevEl.tagName === 'H2' ||
                             prevEl.classList.contains('headline') || prevEl.classList.contains('lead');
          var isCurrentHeader = el.tagName === 'H1' || el.tagName === 'H2' ||
                                el.classList.contains('headline') || el.classList.contains('lead');
          
          if (isPrevHeader) {
            currentDelay += 160;
          } else if (isCurrentHeader) {
            currentDelay += 160;
          } else {
            currentDelay += baseStagger;
          }
        }
        el.style.transitionDelay = currentDelay + 'ms';
        el.classList.add('reveal-visible');
      });
    }

    // Start observing items
    revealItems.forEach(function(item) {
      revealObserver.observe(item);
      hideObserver.observe(item);
    });
  };
})();
