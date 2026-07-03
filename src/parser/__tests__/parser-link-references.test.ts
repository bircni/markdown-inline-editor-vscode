import { MarkdownParser } from '../../parser';

describe('MarkdownParser - Link references (#124)', () => {
  let parser: MarkdownParser;

  beforeEach(async () => {
    parser = await MarkdownParser.create();
  });

  it('styles [text][ref] reference links and hides reference syntax', () => {
    const markdown = '[like][this]\n\n[this]: https://target.for/this';
    const result = parser.extractDecorations(markdown);

    const linkDec = result.find((d) => d.type === 'link');
    expect(linkDec).toBeDefined();
    expect(linkDec?.url).toBe('https://target.for/this');
    expect(linkDec?.startPos).toBe(1);
    expect(linkDec?.endPos).toBe(5);

    const hideRanges = result.filter((d) => d.type === 'hide');
    expect(hideRanges.some((d) => d.startPos === 0 && d.endPos === 1)).toBe(true);
    expect(hideRanges.some((d) => d.startPos === 5 && d.endPos === 6)).toBe(true);
    expect(hideRanges.some((d) => d.startPos === 6 && d.endPos === 12)).toBe(true);
  });

  it('styles [like this][] shortcut reference links', () => {
    const markdown = '[like this][]\n\n[like this]: https://example.com/page';
    const result = parser.extractDecorations(markdown);

    const linkDec = result.find((d) => d.type === 'link');
    expect(linkDec).toBeDefined();
    expect(linkDec?.url).toBe('https://example.com/page');
    expect(linkDec?.startPos).toBe(1);
    expect(linkDec?.endPos).toBe(10);
  });

  it('hides link reference definition lines', () => {
    const markdown = 'See [ref][id]\n\n[id]: <https://example.com>';
    const result = parser.extractDecorations(markdown);

    const definitionHide = result.find(
      (d) => d.type === 'hide' && d.startPos === markdown.indexOf('[id]:'),
    );
    expect(definitionHide).toBeDefined();
    expect(definitionHide?.endPos).toBe(markdown.length);
  });
});

describe('MarkdownParser - Heading attribute lists (#122)', () => {
  let parser: MarkdownParser;

  beforeEach(async () => {
    parser = await MarkdownParser.create();
  });

  it('hides {#id} suffix on headings', () => {
    const markdown = '## This is a long heading {#shorter-name}';
    const result = parser.extractDecorations(markdown);
    const attrStart = markdown.indexOf(' {#shorter-name}');

    expect(result.some((d) => d.type === 'hide' && d.startPos === attrStart)).toBe(true);
    expect(result.some((d) => d.type === 'heading2' && d.endPos === attrStart)).toBe(true);
    expect(result.some((d) => d.type === 'heading2' && d.endPos === markdown.length)).toBe(false);
  });

  it('hides {#id .class} attribute suffix on headings', () => {
    const markdown = '### Title {#my-id .custom-class}';
    const result = parser.extractDecorations(markdown);
    const attrStart = markdown.indexOf(' {#my-id');

    expect(result.some((d) => d.type === 'hide' && d.startPos === attrStart)).toBe(true);
    expect(result.some((d) => d.type === 'heading3' && d.endPos === attrStart)).toBe(true);
  });

  it('leaves headings without attribute suffix unchanged', () => {
    const markdown = '## Plain heading';
    const result = parser.extractDecorations(markdown);

    expect(result.some((d) => d.type === 'heading2' && d.endPos === markdown.length)).toBe(true);
    expect(result.filter((d) => d.type === 'hide').length).toBe(1);
  });
});
