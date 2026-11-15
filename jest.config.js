module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/?(*.)+(spec|test).js'],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^expo-secure-store$': '<rootDir>/src/core/security/secure-store.test-adapter.js',
  },
};
