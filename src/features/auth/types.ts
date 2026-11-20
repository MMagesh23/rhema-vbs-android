export type TeacherUser = {
  _id: string;
  userID: string;
  name: string;
  role: string;
  email?: string;
  mustChangePassword?: boolean;
};
export type AuthTokens = { accessToken: string; refreshToken: string };