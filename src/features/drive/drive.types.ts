export type DriveConnectionStatus =
  | "connected"
  | "reauthorization_required"
  | "revoked";

export type DriveFolders = {
  readonly rootFolderId: string;
  readonly bodyTemplatesFolderId: string;
  readonly garmentsFolderId: string;
  readonly generatedLooksFolderId: string;
};

export type DriveIdentity = {
  readonly subject: string;
  readonly email: string;
};

export type DriveCredentials = DriveFolders &
  DriveIdentity & {
    readonly refreshToken: string;
    readonly status: DriveConnectionStatus;
  };
