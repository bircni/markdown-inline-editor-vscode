/**
 * Math renderer module for converting LaTeX to SVG using MathJax.
 * 
 * This module handles LaTeX-to-SVG conversion following the Markless approach,
 * using MathJax full package with TeX input and SVG output.
 */

// CSS for error styling in MathJax SVG output
const MATHJAX_ERROR_CSS = [
  'svg a{fill:blue;stroke:blue}',
  '[data-mml-node="merror"]>g{fill:red;stroke:red}',
  '[data-mml-node="merror"]>rect[data-background]{fill:yellow;stroke:none}',
  '[data-frame],[data-line]{stroke-width:70px;fill:none}',
  '.mjx-dashed{stroke-dasharray:140}',
  '.mjx-dotted{stroke-linecap:round;stroke-dasharray:0,140}',
  'use[data-c]{stroke-width:3px}'
].join('');

/**
 * MathJax components (lazy-loaded)
 */
let mathjax: any;
let TeX: any;
let SVG: any;
let liteAdaptor: any;
let RegisterHTMLHandler: any;
let AllPackages: any;
let html: any;

/**
 * Initializes MathJax components (lazy initialization).
 * Called automatically on first use.
 */
function initializeMathJax(): void {
  if (html) {
    return; // Already initialized
  }

  try {
    // Load MathJax components using require (CommonJS)
    mathjax = require('mathjax-full/js/mathjax.js').mathjax;
    TeX = require('mathjax-full/js/input/tex.js').TeX;
    SVG = require('mathjax-full/js/output/svg.js').SVG;
    liteAdaptor = require('mathjax-full/js/adaptors/liteAdaptor.js').liteAdaptor;
    RegisterHTMLHandler = require('mathjax-full/js/handlers/html.js').RegisterHTMLHandler;
    AllPackages = require('mathjax-full/js/input/tex/AllPackages.js').AllPackages;

    // Set up MathJax
    const adaptor = liteAdaptor();
    RegisterHTMLHandler(adaptor);

    // Configure packages (all LaTeX packages for full support)
    const packages = { packages: AllPackages.sort().join(', ').split(/\s*,\s*/) };

    const tex = new TeX(packages);
    const svg = new SVG({ fontCache: 'local' });
    html = mathjax.document('', { InputJax: tex, OutputJax: svg });
  } catch (error) {
    console.error('Failed to initialize MathJax:', error);
    throw error;
  }
}

/**
 * Converts LaTeX string to SVG string.
 * 
 * @param texString - LaTeX math expression (without delimiters)
 * @param display - Whether this is display (block) math (true) or inline math (false)
 * @param height - Optional target height in pixels for scaling
 * @returns SVG string with embedded CSS
 */
export function texToSvg(texString: string, display: boolean, height?: number): string {
  // Lazy initialization
  if (!html) {
    initializeMathJax();
  }

  try {
    const adaptor = liteAdaptor();
    const node = html.convert(texString, { display: display });
    const attributes = node.children[0].attributes;

    // Scale SVG to match line height if height is provided
    if (height && attributes.height && attributes.width) {
      const originalHeight = parseFloat(attributes.height);
      const originalWidth = parseFloat(attributes.width);
      
      if (originalHeight > 0) {
        attributes.width = `${(originalWidth * height) / originalHeight}px`;
        attributes.height = `${height}px`;
      }
    }

    attributes.preserveAspectRatio = 'xMinYMin meet';
    let svgElement = adaptor.innerHTML(node);
    
    // Add CSS for error styling
    svgElement = svgElement.replace(/<defs>/, `<defs><style>${MATHJAX_ERROR_CSS}</style>`);
    
    return svgElement;
  } catch (error) {
    console.error('Error converting LaTeX to SVG:', error);
    // Return a simple error SVG
    return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="20"><text x="0" y="15" fill="red">Math Error</text></svg>`;
  }
}

/**
 * Converts SVG string to data URI (base64 encoded).
 * 
 * @param svg - SVG string
 * @returns Data URI string (data:image/svg+xml;base64,...)
 */
export function svgToUri(svg: string): string {
  // Convert SVG string to base64
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}
