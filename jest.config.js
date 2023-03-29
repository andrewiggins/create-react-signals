module.exports = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest/presets/js-with-ts',
  resolver: require.resolve('./scripts/jestResolver'),
};
