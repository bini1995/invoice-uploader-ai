export default {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'routes/**/*.js',
    'controllers/**/*.js',
    'middleware/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/'
  ]
};
