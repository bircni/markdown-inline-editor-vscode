import { workspace } from '../../test/__mocks__/vscode';
import { config } from '../../config';

const mockGet = jest.fn();
const mockGetConfiguration = jest.fn().mockReturnValue({ get: mockGet });

(workspace as any).getConfiguration = mockGetConfiguration;

describe('config.colors', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  describe('hex validation', () => {
    it('returns undefined when setting is unset', () => {
      mockGet.mockImplementation((key: string) => {
        if (key.startsWith('colors.')) return undefined;
        return undefined;
      });
      expect(config.colors.heading1()).toBeUndefined();
      expect(config.colors.link()).toBeUndefined();
    });

    it('returns valid 6-digit hex', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'colors.heading1') return '#e06c75';
        return undefined;
      });
      expect(config.colors.heading1()).toBe('#e06c75');
    });

    it('returns valid 3-digit hex', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'colors.link') return '#f00';
        return undefined;
      });
      expect(config.colors.link()).toBe('#f00');
    });

    it('returns undefined for invalid hex', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'colors.heading1') return 'not-a-color';
        return undefined;
      });
      expect(config.colors.heading1()).toBeUndefined();
    });

    it('returns undefined for malformed hex (no #)', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'colors.heading1') return 'e06c75';
        return undefined;
      });
      expect(config.colors.heading1()).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'colors.heading1') return '';
        return undefined;
      });
      expect(config.colors.heading1()).toBeUndefined();
    });

    it('trims whitespace and accepts valid hex', () => {
      mockGet.mockImplementation((key: string) => {
        if (key === 'colors.heading1') return '  #e06c75  ';
        return undefined;
      });
      expect(config.colors.heading1()).toBe('#e06c75');
    });
  });

  describe('all 14 color getters', () => {
    const keys = [
      'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6',
      'link', 'listMarker', 'inlineCode', 'emphasis', 'blockquote',
      'image', 'horizontalRule', 'checkbox',
    ] as const;

    it('each getter reads correct config key', () => {
      keys.forEach((key, i) => {
        mockGet.mockImplementation((configKey: string) => {
          return configKey === `colors.${key}` ? '#abc' : undefined;
        });
        const getter = config.colors[key];
        expect(getter()).toBe('#abc');
      });
    });
  });
});
