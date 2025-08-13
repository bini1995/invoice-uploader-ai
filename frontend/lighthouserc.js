export default {
  ci: {
    collect: {
      staticDistDir: 'build',
      numberOfRuns: 1,
      settings: { emulatedFormFactor: 'mobile' }
    },
    assert: {
      assertions: {
        'metrics/largest-contentful-paint': ['error', { 'maxNumericValue': 2500 }],
        'metrics/interactive': ['error', { 'maxNumericValue': 3500 }],
        'metrics/cumulative-layout-shift': ['error', { 'maxNumericValue': 0.1 }]
      }
    }
  }
};
