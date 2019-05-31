module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/test'],
  setupFiles: ['<rootDir>/src/setup.ts', 'jest-date-mock'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
