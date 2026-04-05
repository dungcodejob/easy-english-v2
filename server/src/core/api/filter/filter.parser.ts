import { type Token, Tokenizer } from './filter-tokenizer';
import { FilterSyntaxException } from './filter.exception';
import {
  COMPARISON_OPERATORS,
  type ComparisonOperator,
  type FilterNode,
  type FilterValue,
  STRING_FUNCTIONS,
  type StringFunction,
} from './filter.types';

/**
 * Simple recursive descent parser for OData-style filter expressions
 * Grammar (simplified ABNF from spec):
 *   filterExpr  = orExpr
 *   orExpr      = andExpr *( "or" andExpr )
 *   andExpr     = notExpr *( "and" notExpr )
 *   notExpr     = "not" notExpr / primaryExpr
 *   primaryExpr = "(" filterExpr ")" / comparison / functionCall
 */

class Parser {
  private pos = 0;

  constructor(private tokens: Token[]) {}

  parse(): FilterNode {
    if (this.tokens.length === 0) {
      throw new FilterSyntaxException('Empty filter expression');
    }
    const result = this.parseOrExpr();

    if (this.pos < this.tokens.length) {
      const token = this.tokens[this.pos];

      throw new FilterSyntaxException(
        `Unexpected token: ${token.value}`,
        token.position,
      );
    }

    return result;
  }

  private current(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  private parseOrExpr(): FilterNode {
    let left = this.parseAndExpr();

    while (
      this.current()?.type === 'keyword' &&
      this.current()?.value === 'or'
    ) {
      this.consume(); // consume 'or'
      const right = this.parseAndExpr();

      left = { type: 'logical', operator: 'or', left, right };
    }

    return left;
  }

  private parseAndExpr(): FilterNode {
    let left = this.parseNotExpr();

    while (
      this.current()?.type === 'keyword' &&
      this.current()?.value === 'and'
    ) {
      this.consume(); // consume 'and'
      const right = this.parseNotExpr();

      left = { type: 'logical', operator: 'and', left, right };
    }

    return left;
  }

  private parseNotExpr(): FilterNode {
    if (this.current()?.type === 'keyword' && this.current()?.value === 'not') {
      this.consume(); // consume 'not'
      const operand = this.parseNotExpr();

      return { type: 'not', operand };
    }

    return this.parsePrimaryExpr();
  }

  private parsePrimaryExpr(): FilterNode {
    const token = this.current();

    if (!token) {
      throw new FilterSyntaxException('Unexpected end of expression');
    }

    // Grouping: ( expr )
    if (token.type === 'lparen') {
      this.consume(); // consume '('
      const expr = this.parseOrExpr();
      const closing = this.current();

      if (closing?.type !== 'rparen') {
        throw new FilterSyntaxException(
          'Missing closing parenthesis',
          token.position,
        );
      }
      this.consume(); // consume ')'

      return { type: 'group', expression: expr };
    }

    // Function call: contains(field, 'value')
    if (token.type === 'operator' && STRING_FUNCTIONS[token.value]) {
      const funcName = this.consume().value as StringFunction;

      this.expect('lparen', '(');
      const fieldToken = this.expect('identifier', 'field name');

      this.expect('comma', ',');
      const valueToken = this.expect('string', 'string value');

      this.expect('rparen', ')');

      return {
        type: 'function',
        name: funcName,
        field: fieldToken.value,
        value: valueToken.value,
      };
    }

    // Comparison: field op value
    if (token.type === 'identifier') {
      const field = this.consume().value;
      const opToken = this.current();

      if (
        opToken?.type !== 'operator' ||
        !COMPARISON_OPERATORS[opToken.value]
      ) {
        throw new FilterSyntaxException(
          `Expected comparison operator after field "${field}"`,
          opToken?.position,
        );
      }
      const operator = this.consume().value as ComparisonOperator;
      const value = this.parseValue();

      return { type: 'comparison', field, operator, value };
    }

    throw new FilterSyntaxException(
      `Unexpected token: ${token.value}`,
      token.position,
    );
  }

  private parseValue(): FilterValue {
    const token = this.current();

    if (!token) {
      throw new FilterSyntaxException('Expected value');
    }

    switch (token.type) {
      case 'string':
        this.consume();

        return token.value;
      case 'number':
        this.consume();

        return parseFloat(token.value);
      case 'boolean':
        this.consume();

        return token.value === 'true';
      case 'null':
        this.consume();

        return null;
      default:
        throw new FilterSyntaxException(
          `Unexpected token for value: ${token.value}`,
        );
    }
  }

  private expect(type: Token['type'], description: string): Token {
    const token = this.current();

    if (token?.type !== type) {
      throw new FilterSyntaxException(
        `Expected ${description}`,
        token?.position,
      );
    }

    return this.consume();
  }
}

/**
 * Parse a $filter string into a FilterNode AST
 */
export function parseFilter(filter: string): FilterNode {
  const tokenizer = new Tokenizer(filter);
  const tokens = tokenizer.tokenize();
  const parser = new Parser(tokens);

  return parser.parse();
}
