import { 
  getHeadingDecorationRenderOptions, 
  getGenericHeadingDecorationRenderOptions,
} from '../../decorations';

describe('Heading decoration line-height', () => {
  describe('getGenericHeadingDecorationRenderOptions', () => {
    it('should not include lineHeight when options is undefined', () => {
      const options = getGenericHeadingDecorationRenderOptions();
      expect(options).toEqual({
        fontWeight: 'bold',
      });
      expect(options).not.toHaveProperty('lineHeight');
    });

    it('should not include lineHeight when lineHeight is empty string', () => {
      const options = getGenericHeadingDecorationRenderOptions({ lineHeight: '' });
      expect(options).toEqual({
        fontWeight: 'bold',
      });
      expect(options).not.toHaveProperty('lineHeight');
    });

    it('should not include lineHeight when lineHeight is whitespace', () => {
      const options = getGenericHeadingDecorationRenderOptions({ lineHeight: '   ' });
      expect(options).toEqual({
        fontWeight: 'bold',
      });
      expect(options).not.toHaveProperty('lineHeight');
    });

    it('should include lineHeight when provided as unitless number', () => {
      const options = getGenericHeadingDecorationRenderOptions({ lineHeight: '1.4' });
      expect(options).toEqual({
        fontWeight: 'bold',
        lineHeight: '1.4',
      });
    });

    it('should include lineHeight when provided with em unit', () => {
      const options = getGenericHeadingDecorationRenderOptions({ lineHeight: '1.6em' });
      expect(options).toEqual({
        fontWeight: 'bold',
        lineHeight: '1.6em',
      });
    });

    it('should include lineHeight when provided with px unit', () => {
      const options = getGenericHeadingDecorationRenderOptions({ lineHeight: '24px' });
      expect(options).toEqual({
        fontWeight: 'bold',
        lineHeight: '24px',
      });
    });

    it('should trim whitespace from lineHeight value', () => {
      const options = getGenericHeadingDecorationRenderOptions({ lineHeight: '  1.5  ' });
      expect(options).toEqual({
        fontWeight: 'bold',
        lineHeight: '1.5',
      });
    });
  });

  describe('getHeadingDecorationRenderOptions', () => {
    it('should not include lineHeight when options is undefined for H1', () => {
      const options = getHeadingDecorationRenderOptions(1);
      expect(options.textDecoration).toBe('none; font-size: 200%;');
      expect(options.fontWeight).toBe('bold');
      expect(options).not.toHaveProperty('lineHeight');
    });

    it('should not include lineHeight when lineHeight is empty string for H2', () => {
      const options = getHeadingDecorationRenderOptions(2, { lineHeight: '' });
      expect(options.textDecoration).toBe('none; font-size: 150%;');
      expect(options.fontWeight).toBe('bold');
      expect(options).not.toHaveProperty('lineHeight');
    });

    it('should include lineHeight for H1 when provided', () => {
      const options = getHeadingDecorationRenderOptions(1, { lineHeight: '1.4' });
      expect(options).toMatchObject({
        textDecoration: 'none; font-size: 200%;',
        fontWeight: 'bold',
        lineHeight: '1.4',
      });
    });

    it('should include lineHeight for H2 when provided', () => {
      const options = getHeadingDecorationRenderOptions(2, { lineHeight: '1.5' });
      expect(options).toMatchObject({
        textDecoration: 'none; font-size: 150%;',
        fontWeight: 'bold',
        lineHeight: '1.5',
      });
    });

    it('should include lineHeight for H3 when provided', () => {
      const options = getHeadingDecorationRenderOptions(3, { lineHeight: '1.6em' });
      expect(options).toMatchObject({
        textDecoration: 'none; font-size: 110%;',
        fontWeight: 'bold',
        lineHeight: '1.6em',
      });
    });

    it('should include lineHeight for H4 when provided', () => {
      const options = getHeadingDecorationRenderOptions(4, { lineHeight: '24px' });
      expect(options).toMatchObject({
        textDecoration: 'none; font-size: 100%;',
        lineHeight: '24px',
      });
      // H4 doesn't have fontWeight: 'bold', it uses color instead
      expect(options).toHaveProperty('color');
    });

    it('should include lineHeight for H5 when provided', () => {
      const options = getHeadingDecorationRenderOptions(5, { lineHeight: '1.3' });
      expect(options).toMatchObject({
        textDecoration: 'none; font-size: 90%;',
        lineHeight: '1.3',
      });
    });

    it('should include lineHeight for H6 when provided', () => {
      const options = getHeadingDecorationRenderOptions(6, { lineHeight: '1.2' });
      expect(options).toMatchObject({
        textDecoration: 'none; font-size: 80%;',
        lineHeight: '1.2',
      });
    });

    it('should throw error for invalid heading level 0', () => {
      expect(() => getHeadingDecorationRenderOptions(0)).toThrow('Invalid heading level: 0');
    });

    it('should throw error for invalid heading level 7', () => {
      expect(() => getHeadingDecorationRenderOptions(7)).toThrow('Invalid heading level: 7');
    });

    it('should trim whitespace from lineHeight value', () => {
      const options = getHeadingDecorationRenderOptions(1, { lineHeight: '  1.4  ' });
      expect(options).toMatchObject({
        lineHeight: '1.4',
      });
    });
  });
});

