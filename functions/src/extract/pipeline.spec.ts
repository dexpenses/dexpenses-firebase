import { checkDependencies } from './DependsOn';
import { extractorPipelineFactory } from './pipeline';

describe('Extractor pipeline', () => {
  it('should satisfy all dependencies', () => {
    const extractorPipeline = extractorPipelineFactory({});
    expect(() => checkDependencies(extractorPipeline)).not.toThrowError();
  });
});
