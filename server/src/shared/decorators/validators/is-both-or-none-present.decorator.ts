import {
  type ValidationArguments,
  type ValidationOptions,
  registerDecorator,
} from 'class-validator';

export function IsBothOrNonePresent(
  property: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsBothOrNonePresent',

      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const relatedValue = (args.object as any)[relatedPropertyName];

          return (value && relatedValue) || (!value && !relatedValue);
        },
        defaultMessage(args: ValidationArguments) {
          return `$property and ${args.constraints[0]} must be both provided or omitted`;
        },
      },
    });
  };
}
