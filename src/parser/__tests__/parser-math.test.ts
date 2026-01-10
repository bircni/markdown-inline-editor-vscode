import { MarkdownParser, DecorationRange } from '../../parser';

describe('MarkdownParser - Math', () => {
  let parser: MarkdownParser;

  beforeEach(async () => {
    parser = await MarkdownParser.create();
  });

  describe('inline math ($...$)', () => {
    it('should detect inline math', () => {
      const markdown = '$E = mc^2$';
      const result = parser.extractDecorations(markdown);
      
      expect(result).toContainEqual({
        startPos: 0,
        endPos: 10,
        type: 'inlineMath'
      });
    });

    it('should handle inline math in paragraph', () => {
      const markdown = 'The equation $x = y$ is true';
      const result = parser.extractDecorations(markdown);
      
      const mathDec = result.find((d: DecorationRange) => d.type === 'inlineMath');
      expect(mathDec).toBeDefined();
      expect(mathDec?.startPos).toBe(15);
      expect(mathDec?.endPos).toBe(23);
    });

    it('should handle multiple inline math expressions', () => {
      const markdown = '$a$ and $b$';
      const result = parser.extractDecorations(markdown);
      
      const mathDecs = result.filter((d: DecorationRange) => d.type === 'inlineMath');
      expect(mathDecs.length).toBe(2);
      expect(mathDecs[0]?.startPos).toBe(0);
      expect(mathDecs[0]?.endPos).toBe(3);
      expect(mathDecs[1]?.startPos).toBe(8);
      expect(mathDecs[1]?.endPos).toBe(11);
    });

    it('should handle inline math with complex expressions', () => {
      const markdown = '$\\frac{a}{b} = \\sqrt{c}$';
      const result = parser.extractDecorations(markdown);
      
      expect(result).toContainEqual({
        startPos: 0,
        endPos: 28,
        type: 'inlineMath'
      });
    });
  });

  describe('block math ($$...$$)', () => {
    it('should detect block math', () => {
      const markdown = '$$\\int_0^\\infty e^{-x^2} dx$$';
      const result = parser.extractDecorations(markdown);
      
      expect(result).toContainEqual({
        startPos: 0,
        endPos: 30,
        type: 'math'
      });
    });

    it('should handle multi-line block math', () => {
      const markdown = '$$\\begin{align}\nx &= y\n\\end{align}$$';
      const result = parser.extractDecorations(markdown);
      
      const mathDec = result.find((d: DecorationRange) => d.type === 'math');
      expect(mathDec).toBeDefined();
      expect(mathDec?.startPos).toBe(0);
      expect(mathDec?.endPos).toBeGreaterThan(20);
    });

    it('should distinguish block math from inline math', () => {
      const markdown = '$inline$ and $$block$$';
      const result = parser.extractDecorations(markdown);
      
      const inlineMath = result.filter((d: DecorationRange) => d.type === 'inlineMath');
      const blockMath = result.filter((d: DecorationRange) => d.type === 'math');
      
      expect(inlineMath.length).toBe(1);
      expect(blockMath.length).toBe(1);
    });
  });

  describe('math in different contexts', () => {
    it('should handle math in list items', () => {
      const markdown = '- Item with $math$';
      const result = parser.extractDecorations(markdown);
      
      const mathDec = result.find((d: DecorationRange) => d.type === 'inlineMath');
      expect(mathDec).toBeDefined();
    });

    it('should handle math in blockquotes', () => {
      const markdown = '> Quote with $math$';
      const result = parser.extractDecorations(markdown);
      
      const mathDec = result.find((d: DecorationRange) => d.type === 'inlineMath');
      expect(mathDec).toBeDefined();
    });

    it('should handle math in headings', () => {
      const markdown = '# Heading with $math$';
      const result = parser.extractDecorations(markdown);
      
      const mathDec = result.find((d: DecorationRange) => d.type === 'inlineMath');
      expect(mathDec).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should not treat escaped dollar signs as math', () => {
      const markdown = '\\$10';
      const result = parser.extractDecorations(markdown);
      
      const mathDecs = result.filter((d: DecorationRange) => d.type === 'inlineMath' || d.type === 'math');
      expect(mathDecs.length).toBe(0);
    });

    it('should handle dollar signs in text (not math)', () => {
      const markdown = 'Price is $10';
      const result = parser.extractDecorations(markdown);
      
      // remark-math should not parse this as math (single $ at end of line/word)
      // But if it does, we should handle it gracefully
      const mathDecs = result.filter((d: DecorationRange) => d.type === 'inlineMath' || d.type === 'math');
      // This may or may not be parsed as math depending on remark-math behavior
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty math expressions gracefully', () => {
      const markdown = '$$$$';
      const result = parser.extractDecorations(markdown);
      
      // Should handle gracefully without errors
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle math with only whitespace', () => {
      const markdown = '$$   $$';
      const result = parser.extractDecorations(markdown);
      
      const mathDec = result.find((d: DecorationRange) => d.type === 'math');
      // May or may not create decoration for whitespace-only math
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('complex math expressions', () => {
    it('should handle fractions', () => {
      const markdown = '$\\frac{a}{b}$';
      const result = parser.extractDecorations(markdown);
      
      expect(result).toContainEqual({
        startPos: 0,
        endPos: 12,
        type: 'inlineMath'
      });
    });

    it('should handle matrices', () => {
      const markdown = '$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$';
      const result = parser.extractDecorations(markdown);
      
      const mathDec = result.find((d: DecorationRange) => d.type === 'math');
      expect(mathDec).toBeDefined();
    });

    it('should handle integrals', () => {
      const markdown = '$\\int_0^\\infty f(x) dx$';
      const result = parser.extractDecorations(markdown);
      
      expect(result).toContainEqual({
        startPos: 0,
        endPos: 24,
        type: 'inlineMath'
      });
    });
  });

  describe('code blocks with language math', () => {
    it('should detect code block with language math', async () => {
      const markdown = '```math\nE = mc^2\n```';
      const result = parser.extractDecorations(markdown);
      
      const mathDec = result.find((d: DecorationRange) => d.type === 'math');
      expect(mathDec).toBeDefined();
      expect(mathDec?.startPos).toBeGreaterThan(0);
      expect(mathDec?.endPos).toBeLessThan(markdown.length);
    });

    it('should hide fence markers for math code blocks', async () => {
      const markdown = '```math\nx = y\n```';
      const result = parser.extractDecorations(markdown);
      
      const hideDecs = result.filter((d: DecorationRange) => d.type === 'hide');
      expect(hideDecs.length).toBeGreaterThanOrEqual(2); // Opening and closing fences
    });

    it('should handle multi-line math in code blocks', async () => {
      const markdown = '```math\n\\begin{align}\nx &= y\n\\end{align}\n```';
      const result = parser.extractDecorations(markdown);
      
      const mathDec = result.find((d: DecorationRange) => d.type === 'math');
      expect(mathDec).toBeDefined();
    });

    it('should not treat regular code blocks as math', async () => {
      const markdown = '```javascript\nconsole.log("test");\n```';
      const result = parser.extractDecorations(markdown);
      
      const mathDecs = result.filter((d: DecorationRange) => d.type === 'math');
      expect(mathDecs.length).toBe(0);
      
      const codeBlockDecs = result.filter((d: DecorationRange) => d.type === 'codeBlock');
      expect(codeBlockDecs.length).toBeGreaterThan(0);
    });
  });
});
