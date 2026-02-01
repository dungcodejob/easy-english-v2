export interface GenerateUsernameProps {
  email: string;
}

export interface IUsernameGenerator {
  generate(props: GenerateUsernameProps): string;
  appendSuffix(username: string): string;
}
