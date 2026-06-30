import { User } from 'src/user/entities/user.entity';
import { Question } from 'src/questions/entities/question.entity';
import { Answers as PrismaAnswers } from '../../generated/prisma/client.js';
export class Answer implements PrismaAnswers {
  id: number;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  user: User;
  questionId: number;
  question?: Question;
}
