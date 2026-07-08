export class PipelineError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly recoverable = true
  ) {
    super(message);
    this.name = "PipelineError";
  }
}

export class VendorNotFoundError extends PipelineError {
  constructor(phone: string) {
    super(`Vendor not registered: ${phone}`, "VENDOR_NOT_FOUND", true);
    this.name = "VendorNotFoundError";
  }
}

export class PONotFoundError extends PipelineError {
  constructor(identifier: string) {
    super(`PO not found: ${identifier}`, "PO_NOT_FOUND", true);
    this.name = "PONotFoundError";
  }
}

export class TranscriptionError extends PipelineError {
  constructor(detail: string) {
    super(`Transcription failed: ${detail}`, "TRANSCRIPTION_ERROR", true);
    this.name = "TranscriptionError";
  }
}

export class ExtractionError extends PipelineError {
  constructor(detail: string) {
    super(`Extraction failed: ${detail}`, "EXTRACTION_ERROR", true);
    this.name = "ExtractionError";
  }
}

export class UnauthorizedError extends PipelineError {
  constructor() {
    super("Unauthorized", "UNAUTHORIZED", false);
    this.name = "UnauthorizedError";
  }
}

export function isPipelineError(err: unknown): err is PipelineError {
  return err instanceof PipelineError;
}
