export class HasWorkspaceResponseDto {
  constructor(
    readonly hasWorkspace: boolean,
    readonly workspaceId?: string,
  ) {}
}
