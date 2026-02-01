import { FilterSyntaxException } from './filter.exception';
import {
  COMPARISON_OPERATORS,
  LOGICAL_OPERATORS,
  STRING_FUNCTIONS,
} from './filter.types';

export interface Token {
  type:
    | 'identifier'
    | 'operator'
    | 'string'
    | 'number'
    | 'boolean'
    | 'null'
    | 'lparen'
    | 'rparen'
    | 'comma'
    | 'keyword';
  value: string;
  position: number;
}

export class Tokenizer {
  private pos = 0;
  private tokens: Token[] = [];

  constructor(private input: string) {}

  tokenize(): Token[] {
    while (this.pos < this.input.length) {
      this.skipWhitespace();
      if (this.pos >= this.input.length) break;

      const char = this.input[this.pos];

      if (char === '(') {
        this.tokens.push({ type: 'lparen', value: '(', position: this.pos });
        this.pos++;
      } else if (char === ')') {
        this.tokens.push({ type: 'rparen', value: ')', position: this.pos });
        this.pos++;
      } else if (char === ',') {
        this.tokens.push({ type: 'comma', value: ',', position: this.pos });
        this.pos++;
      } else if (char === "'") {
        this.readString();
      } else if (
        this.isDigit(char) ||
        (char === '-' && this.isDigit(this.peek(1)))
      ) {
        this.readNumber();
      } else if (this.isIdentifierStart(char)) {
        this.readIdentifier();
      } else {
        throw new FilterSyntaxException(
          `Unexpected character: ${char}`,
          this.pos,
        );
      }
    }
    return this.tokens;
  }

  private skipWhitespace() {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }

  private peek(offset = 0): string {
    return this.input[this.pos + offset] || '';
  }

  private isDigit(c: string): boolean {
    return /[0-9]/.test(c);
  }

  private isIdentifierStart(c: string): boolean {
    return /[a-zA-Z_]/.test(c);
  }

  private isIdentifierChar(c: string): boolean {
    return /[a-zA-Z0-9_]/.test(c);
  }

  private readString() {
    const start = this.pos;
    this.pos++; // skip opening quote
    let value = '';
    while (this.pos < this.input.length) {
      const char = this.input[this.pos];
      if (char === "'") {
        if (this.peek(1) === "'") {
          // escaped quote
          value += "'";
          this.pos += 2;
        } else {
          this.pos++; // skip closing quote
          this.tokens.push({ type: 'string', value, position: start });
          return;
        }
      } else {
        value += char;
        this.pos++;
      }
    }
    throw new FilterSyntaxException('Unterminated string', start);
  }

  private readNumber() {
    const start = this.pos;
    let value = '';
    if (this.input[this.pos] === '-') {
      value += '-';
      this.pos++;
    }
    while (this.pos < this.input.length && this.isDigit(this.input[this.pos])) {
      value += this.input[this.pos];
      this.pos++;
    }
    if (this.input[this.pos] === '.') {
      value += '.';
      this.pos++;
      while (
        this.pos < this.input.length &&
        this.isDigit(this.input[this.pos])
      ) {
        value += this.input[this.pos];
        this.pos++;
      }
    }
    this.tokens.push({ type: 'number', value, position: start });
  }

  private readIdentifier() {
    const start = this.pos;
    let value = '';
    while (
      this.pos < this.input.length &&
      this.isIdentifierChar(this.input[this.pos])
    ) {
      value += this.input[this.pos];
      this.pos++;
    }
    const lower = value.toLowerCase();

    if (lower === 'true' || lower === 'false') {
      this.tokens.push({ type: 'boolean', value: lower, position: start });
    } else if (lower === 'null') {
      this.tokens.push({ type: 'null', value: 'null', position: start });
    } else if (LOGICAL_OPERATORS[lower]) {
      this.tokens.push({ type: 'keyword', value: lower, position: start });
    } else if (COMPARISON_OPERATORS[lower] || STRING_FUNCTIONS[lower]) {
      this.tokens.push({ type: 'operator', value: lower, position: start });
    } else {
      this.tokens.push({ type: 'identifier', value, position: start });
    }
  }
}
