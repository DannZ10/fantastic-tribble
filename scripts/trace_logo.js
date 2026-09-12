// One-off: trace the logo raster into a real SVG so it can scale, recolor,
// and be used as a CSS mask-image / favicon.
const potrace = require('potrace');
const fs = require('fs');

potrace.trace(
  'public/brand/logo-mark.png',
  { threshold: 128, turdSize: 8, optCurve: true, optTolerance: 0.2, color: 'currentColor', background: 'transparent' },
  (err, svg) => {
    if (err) throw err;
    // currentColor lets CSS drive the fill from either theme
    fs.writeFileSync('public/brand/logo.svg', svg);
    console.log('wrote public/brand/logo.svg', svg.length, 'bytes');
  }
);
