import { Version } from './version';

const version = new Version();

describe('model version', () => {
  beforeAll(async () => {});

  it('Version should be a string (not empty)', () => {
    expect(version.version).toBeDefined();
    expect(version.version.length).toBeGreaterThan(0);
  });
});
