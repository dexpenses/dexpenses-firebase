import { checkDependencies } from './DependsOn';
import { extractorPipeline } from './pipeline';

describe('Extractor pipeline', () => {
  it('should satisfy all dependencies', () => {
    expect(() => checkDependencies(extractorPipeline)).not.toThrowError();
  });
});
