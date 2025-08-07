import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  if (!password) return '';
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  return hashed;
}

export async function comparePassword(
  plainTextPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
}
