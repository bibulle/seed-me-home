module.exports = {
  name: 'frontend',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/frontend/',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ],
  setupFiles: ['jest-localstorage-mock'],
  setupFilesAfterEnv: ['./src/test-setup.ts'],
  globals: {
    'ts-jest': {
      stringifyContentPathRegex: '\\.html$',
      tsConfig: 'tsconfig.json',
      astTransformers: [require.resolve('jest-preset-angular/InlineHtmlStripStylesTransformer')]
    }
  }
};
