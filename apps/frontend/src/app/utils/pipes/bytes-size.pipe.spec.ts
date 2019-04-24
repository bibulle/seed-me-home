import { BytesSizePipe } from './bytes-size.pipe';

describe('BytesSizePipe', () => {
  it('create an instance', () => {
    const pipe = new BytesSizePipe();
    expect(pipe).toBeTruthy();
  });

  it('presentation should be 2 digits from Terra to Byte', () => {
    const pipe = new BytesSizePipe();

    expect(pipe.transform('12')).toBe('12 B');

    expect(pipe.transform('1234')).toBe('1.21 KB');

    expect(pipe.transform('1263616')).toBe('1.21 MB');

    expect(pipe.transform('1293942784')).toBe('1.21 GB');

    expect(pipe.transform('1324997410816')).toBe('1.21 TB');
  });

  it('return input if not a number', () => {
    const pipe = new BytesSizePipe();

    expect(pipe.transform('abc')).toBe('abc');
  });
});
