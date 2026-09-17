import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class AnswersService {
  constructor(private prisma: PrismaService) {}

  create(createAnswerDto: CreateAnswerDto, userId: number, questionId: number) {
    const newAnser = {
      body: createAnswerDto.body,
      user: {
        connect: {
          id: userId,
        },
      },
      question: {
        connect: { id: questionId },
      },
    };
    return this.prisma.answers.create({
      data: newAnser,
    });
  }

  findAll() {
    return this.prisma.answers.findMany();
  }

  findOne(id: number) {
    return this.prisma.answers.findUnique({ where: { id } });
  }

  async update(id: number, updateAnswerDto: UpdateAnswerDto) {
    try {
      return await this.prisma.answers.update({
        where: { id },
        data: updateAnswerDto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Answer with id ${id} not found`);
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.answers.delete({ where: { id } });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Answer with id ${id} not found`);
      }
      throw error;
    }
  }
}
