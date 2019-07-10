import { validateNotBlank, validateRequired } from './validation';

describe('validation/notBlank', () => {
  it('should not throw exception', () => {
    validateNotBlank('a');
    validateNotBlank(' a');
    validateNotBlank('a ');
  });

  it('should throw exception', () => {
    expect(() => validateNotBlank()).toThrowError();
    expect(() => validateNotBlank(null)).toThrowError();
    expect(() => validateNotBlank('')).toThrowError();
    expect(() => validateNotBlank(' ')).toThrowError();
  });
});

describe('validation/required', () => {
  it('should not throw exception', () => {
    validateRequired({});
    validateRequired(0);
    validateRequired('');
    validateRequired(' ');
    validateRequired([]);
  });

  it('should throw exception', () => {
    expect(() => validateRequired()).toThrowError();
    expect(() => validateRequired(null)).toThrowError();
  });
});
