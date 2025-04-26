import type {NewFormatting} from "../../state/formattings";

export class FormattingNewState {
  constructor(
    public readonly formatting: NewFormatting,
  ) {}

  public readonly save = () => {};

  public validate?: () => ValidationResult;
}

export type ValidationResult = 'valid' | 'fine' | ValidationErrorResult[];

export interface ValidationErrorResult {
  message: string;
  field?: string;
}
