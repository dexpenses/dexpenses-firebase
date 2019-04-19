if (!process.env.SONAR_TOKEN) {
  throw Error('SONAR_TOKEN not present. Aborting.');
}

require('sonarqube-scanner')(
  {
    serverUrl: 'https://sonarcloud.io',
    token: process.env.SONAR_TOKEN,
    options: {
      'sonar.organization': 'dexmo007-github',
      'sonar.sources': 'src/',
      'sonar.exclusions': 'node_modules/**,sonar.js,**/*.spec.ts,**/*.snap',
      'sonar.typescript.tslint.reportPaths': '.sonar/tslint-report.json',
      'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',
    },
  },
  () => {}
);
