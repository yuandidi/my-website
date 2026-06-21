import { describe, expect, it } from 'vitest';
import { escapeLikePattern } from './search';

describe('escapeLikePattern', () => {
  it('escapes LIKE wildcard characters', () => {
    expect(escapeLikePattern('100%_done\\')).toBe('100\\%\\_done\\\\');
  });
});
