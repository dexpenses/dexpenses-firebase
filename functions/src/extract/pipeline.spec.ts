import { expect } from 'chai';
import 'mocha';
import * as fs from 'fs';
import * as path from 'path';
import extractorPipeline from './pipeline';

describe('Extractor pipeline', () => {
  const testRoot = path.resolve(__dirname, '../../test/');
  const dir = path.resolve(testRoot, 'data');
  const testFiles = fs.readdirSync(dir);

  for (const textFile of testFiles) {
    it(`should be successfully extract info from '${textFile}'`, () => {
      const text = fs.readFileSync(path.resolve(dir, textFile), 'utf8');
      const result = extractorPipeline(text);
      const expected = JSON.parse(
        fs.readFileSync(
          path.resolve(testRoot, 'expected', textFile.replace(/\.txt$/, '.json')),
          'utf8'
        )
      );
      expect(JSON.parse(JSON.stringify(result))).to.deep.equal(expected);
    });
  }
});
