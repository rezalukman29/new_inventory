module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/app/_TEST_/$1',
    },
    reporters: [
        'default',
        [
            'jest-html-reporters', 
            {
                publicPath: 'report_test',
                filename: 'report.html'
            }
        ]
    ]
  };