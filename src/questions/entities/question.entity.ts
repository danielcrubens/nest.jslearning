import { Questions as PrismaQuestions } from '../../generated/prisma/client.js';
export class Question implements PrismaQuestions {
  id: number;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
}
