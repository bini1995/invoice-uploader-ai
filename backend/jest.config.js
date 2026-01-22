export default {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'routes/**/*.js',
    'controllers/**/*.js',
    'middleware/**/*.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/'
  ]
};
