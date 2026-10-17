import { expect, test } from 'vitest';
import { domainName } from '../src/index';

test('domain name is correct', () => {
  expect(domainName).toBe('AI Home Domain');
});
