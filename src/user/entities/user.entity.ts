import { User as PrismaUser } from '../../generated/prisma/client.js';

export class User implements PrismaUser {
  id: number;
  email: string;
  name: string | null;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}
