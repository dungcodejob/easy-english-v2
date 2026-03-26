import {
  type ValidationArguments,
  type ValidationOptions,
  registerDecorator,
} from 'class-validator';

export function IsBothOrNonePresent(
  property: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsBothOrNonePresent',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const [relatedPropertyName] = args.constraints;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          const relatedValue = (args.object as any)[relatedPropertyName];
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return (value && relatedValue) || (!value && !relatedValue);
        },
        defaultMessage(args: ValidationArguments) {
          return `$property and ${args.constraints[0]} must be both provided or omitted`;
        },
      },
    });
  };
}
