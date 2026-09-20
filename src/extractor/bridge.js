/* ============================================================================
 * bridge.js — runs INSIDE the screen iframe.
 *
 * This file is injected verbatim as a plain <script> into every screen's
 * srcdoc. It must stay dependency-free and ES5-ish (no imports, no build step).
 *
 * Job:
 *   1. walk the screen DOM and capture *resolved* computed styles + geometry
 *   2. post the raw capture up to the parent window (postMessage)
 *   3. relay hover / click so the parent can drive the inspector
 *
 * It deliberately sends RAW values. All SwiftUI-oriented interpretation
 * (role inference, stack naming, formatting) lives in TypeScript on the
 * parent side so it stays testable and editable without touching the iframe.
 * ========================================================================== */
;(function () {
  'use strict'

  var HL_ID = 'pc-highlight'

  var NUMERIC = [
    'gap',
    'paddingTop',
    'paddingRight',
    'paddingBottom',
    'paddingLeft',
    'fontSize',
    'fontWeight',
    'lineHeight',
    'letterSpacing',
    'flexGrow',
    'flexShrink',
    'borderTopWidth',
    'borderBottomWidth',
    'borderTopLeftRadius',
    'opacity',
  ]

  var TEXTUAL = [
    'display',
    'position',
    'flexDirection',
    'flexBasis',
    'flexWrap',
    'justifyContent',
    'alignItems',
    'alignSelf',
    'textAlign',
    'textTransform',
    'whiteSpace',
    'textOverflow',
    'color',
    'backgroundColor',
    'backgroundImage',
    'borderTopColor',
    'borderBottomColor',
    'borderTopStyle',
    'boxShadow',
    'maskImage',
    'overflowY',
    'overflowX',
    'fontFamily',
  ]

  var deviceEl = document.querySelector('.device')
  var viewportEl = document.querySelector('.viewport')
  var nodeId = deviceEl ? deviceEl.getAttribute('data-node-id') || '' : ''
  var token = deviceEl ? deviceEl.getAttribute('data-node-token') || '' : ''

  function post(msg) {
    msg.pc = true
    msg.nodeId = nodeId
    msg.token = token
    try {
      window.parent.postMessage(msg, '*')
    } catch (_) {
      /* ignore */
    }
  }

  function num(v) {
    var n = parseFloat(v)
    return isFinite(n) ? Math.round(n * 100) / 100 : 0
  }

  function directText(el) {
    var out = ''
    for (var i = 0; i < el.childNodes.length; i++) {
      var n = el.childNodes[i]
      if (n.nodeType === 3) out += n.nodeValue
    }
    return out.replace(/\s+/g, ' ').trim()
  }

  function capture() {
    if (!viewportEl) return

    // clear previous ids so removed nodes don't linger
    var stale = viewportEl.querySelectorAll('[data-pc-id]')
    for (var s = 0; s < stale.length; s++) stale[s].removeAttribute('data-pc-id')

    var all = viewportEl.querySelectorAll('*')
    var shellRect = document.body.getBoundingClientRect()
    var picked = []

    for (var i = 0; i < all.length; i++) {
      var el = all[i]
      if (el.id === HL_ID) continue
      // an inline SVG is a single Image node; its internals are not UI structure
      if (el.parentElement && el.parentElement.closest('svg')) continue
      var cs = getComputedStyle(el)
      if (cs.display === 'none' || cs.visibility === 'hidden') continue
      var r = el.getBoundingClientRect()
      if (r.width < 1 || r.height < 1) continue
      picked.push({ el: el, cs: cs, rect: r })
    }

    var nodes = []

    for (var k = 0; k < picked.length; k++) {
      picked[k].el.setAttribute('data-pc-id', 'e' + k)
    }

    for (var j = 0; j < picked.length; j++) {
      var item = picked[j]
      var ell = item.el
      var css = item.cs
      var rect = item.rect
      var idj = ell.getAttribute('data-pc-id')

      var style = {}
      var p
      for (p = 0; p < NUMERIC.length; p++) style[NUMERIC[p]] = num(css.getPropertyValue(hyphen(NUMERIC[p])))
      for (p = 0; p < TEXTUAL.length; p++) style[TEXTUAL[p]] = css.getPropertyValue(hyphen(TEXTUAL[p]))

      var text = (ell.textContent || '').replace(/\s+/g, ' ').trim()
      var parentEl = ell.parentElement ? ell.parentElement.closest('[data-pc-id]') : null
      var parentId = parentEl ? parentEl.getAttribute('data-pc-id') : null

      nodes.push({
        id: idj,
        tag: ell.tagName.toLowerCase(),
        parent: parentId,
        depth: 0,
        text: text.slice(0, 160),
        textLength: text.length,
        ownText: directText(ell),
        childCount: ell.children.length,
        box: {
          x: Math.round((rect.left - shellRect.left) * 100) / 100,
          y: Math.round((rect.top - shellRect.top) * 100) / 100,
          w: Math.round(rect.width * 100) / 100,
          h: Math.round(rect.height * 100) / 100,
        },
        // what the element IS, as opposed to how it is laid out: an icon needs
        // a name before it can become Image(systemName:) rather than a shape
        attrs: {
          src: ell.getAttribute('src') || '',
          alt: ell.getAttribute('alt') || '',
          symbol: ell.getAttribute('data-symbol') || '',
          asset: ell.getAttribute('data-asset') || '',
          // the glyph is inlined as a data URI; --icon-src keeps the file name
          iconSrc: (css.getPropertyValue('--icon-src') || '').replace(/^['"]|['"]$/g, '').trim(),
        },
        scroll: {
          y: ell.scrollHeight > ell.clientHeight + 1,
          x: ell.scrollWidth > ell.clientWidth + 1,
        },
        css: style,
      })
    }

    // second pass: depth = number of ancestors in the captured set
    var index = {}
    for (var m = 0; m < nodes.length; m++) index[nodes[m].id] = nodes[m]
    for (var n = 0; n < nodes.length; n++) {
      var guard = 0
      var cur = index[nodes[n].parent]
      while (cur && guard < 64) {
        guard++
        cur = index[cur.parent]
      }
      nodes[n].depth = guard
    }

    post({ type: 'spec', nodes: nodes, device: measureDevice() })
    return nodes
  }

  function hyphen(prop) {
    return prop.replace(/([A-Z])/g, '-$1').toLowerCase()
  }

  function measureDevice() {
    if (!deviceEl) return null
    var r = deviceEl.getBoundingClientRect()
    return { w: Math.round(r.width), h: Math.round(r.height) }
  }

  /* ------------------------------------------------------------------ UI -- */

  var hl = document.createElement('div')
  hl.id = HL_ID
  hl.style.cssText = [
    'position:fixed',
    'pointer-events:none',
    'z-index:2147483647',
    'display:none',
    'box-shadow:0 0 0 1.5px #007aff inset, 0 0 0 1.5px #007aff',
    'background:rgba(0,122,255,0.14)',
    'border-radius:2px',
  ].join(';')

  var badge = document.createElement('div')
  badge.style.cssText = [
    'position:fixed',
    'pointer-events:none',
    'z-index:2147483647',
    'display:none',
    'background:#007aff',
    'color:#fff',
    'font:600 11px/1 -apple-system, system-ui, sans-serif',
    'padding:4px 6px',
    'border-radius:4px',
    'white-space:nowrap',
  ].join(';')

  var selectedId = null

  function show(el) {
    var r = el.getBoundingClientRect()
    hl.style.display = 'block'
    hl.style.left = r.left + 'px'
    hl.style.top = r.top + 'px'
    hl.style.width = r.width + 'px'
    hl.style.height = r.height + 'px'

    var label = el.tagName.toLowerCase()
    if (el.className && typeof el.className === 'string') {
      var first = el.className.trim().split(/\s+/)[0]
      if (first) label += '.' + first
    }
    label += '  ' + Math.round(r.width) + '×' + Math.round(r.height)
    badge.textContent = label
    badge.style.display = 'block'
    var top = r.top - 20
    badge.style.left = r.left + 'px'
    badge.style.top = (top < 0 ? r.bottom + 4 : top) + 'px'
  }

  function hide() {
    hl.style.display = 'none'
    badge.style.display = 'none'
  }

  function targetOf(e) {
    var t = e.target
    if (!t || t.nodeType !== 1 || t.id === HL_ID) return null
    return t.closest ? t.closest('[data-pc-id]') : null
  }

  function onMove(e) {
    if (selectedId) return
    var el = targetOf(e)
    if (el) show(el)
    else hide()
  }

  function onOut() {
    if (!selectedId) hide()
  }

  function onClick(e) {
    var el = targetOf(e)
    e.preventDefault()
    e.stopPropagation()
    if (!el) {
      selectedId = null
      hide()
      post({ type: 'select', id: null })
      return
    }
    selectedId = el.getAttribute('data-pc-id')
    show(el)
    post({ type: 'select', id: selectedId })
  }

  document.addEventListener('mousemove', onMove, true)
  document.addEventListener('mouseleave', onOut, true)
  document.addEventListener('click', onClick, true)

  window.addEventListener('message', function (e) {
    var d = e.data
    if (!d || d.pc !== true) return
    if (d.type === 'selectFromPanel') {
      if (d.token && d.token !== token) return
      selectedId = d.id
      if (!d.id) {
        hide()
        return
      }
      var el = viewportEl.querySelector('[data-pc-id="' + d.id + '"]')
      if (el) show(el)
      else hide()
    } else if (d.type === 'recapture') {
      // parent panel hit the 8s no-spec timeout and asked for a fresh capture
      if (d.token && d.token !== token) return
      emptyTries = 0
      refresh()
    }
  })

  document.body.appendChild(hl)
  document.body.appendChild(badge)

  /* ==========================================================================
   * Boot
   *
   * The document is loaded long before the iframe has been laid out by the
   * parent page. Until that happens every getBoundingClientRect() is 0 and a
   * capture would come back empty — which is exactly what a naive "capture on
   * load" does. So: never capture on a timer, capture when there is something
   * to measure, and keep measuring as the content settles.
   * ======================================================================== */

  var ready = false
  var emptyTries = 0
  var lastHeight = 0

  function measuredHeight() {
    return deviceEl ? Math.ceil(deviceEl.getBoundingClientRect().height) : 0
  }

  function postHeight() {
    var h = measuredHeight()
    if (h <= 0 || Math.abs(h - lastHeight) < 1) return
    lastHeight = h
    post({ type: 'height', value: h })
  }

  function refresh() {
    if (!deviceEl || !viewportEl) return

    // nothing is laid out yet — try again shortly instead of reporting zero
    if (measuredHeight() <= 0) {
      if (emptyTries++ < 40) setTimeout(refresh, 50)
      return
    }

    var nodes = capture()

    if (!nodes || nodes.length === 0) {
      if (emptyTries++ < 40) setTimeout(refresh, 50)
      return
    }

    emptyTries = 0
    if (!ready) {
      ready = true
      post({ type: 'ready' })
    }
    postHeight()
  }

  function observe() {
    if (typeof ResizeObserver !== 'undefined' && deviceEl) {
      new ResizeObserver(function () {
        refresh()
      }).observe(deviceEl)
    }
    window.addEventListener('resize', refresh)
    // webfonts can land late and change wrapping, which changes the height
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        refresh()
      })
    }
  }

  function boot() {
    observe()
    requestAnimationFrame(function () {
      requestAnimationFrame(refresh)
    })
  }

  if (document.readyState === 'complete') {
    boot()
  } else {
    window.addEventListener('load', boot)
  }
})()
