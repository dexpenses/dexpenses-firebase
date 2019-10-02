import { ExtractedReceipt } from '@dexpenses/extract';

export interface ReceiptRecord {
  downloadUrl: string;
  result: ExtractedReceipt;
  tags?: string[];
}
