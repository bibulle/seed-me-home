import { Version } from './version';

describe('model version', () => {
  let version: Version;

  beforeAll(async () => {
    version = new Version();
  });

  it('Version should be a string (not empty)', () => {
    expect(version.version).toBeDefined();
    expect(version.version.length).toBeGreaterThan(0);
  });

  it('Version should be match a version', () => {
    expect(version.version).toBeDefined();
    expect(version.version).toMatch(/^[0-9]+[.][0-9]+[.][0-9]+$/);
  });
});
