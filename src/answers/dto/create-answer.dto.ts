import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateAnswerDto {
  @Length(6)
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({
    description: 'Ignorado — a pergunta é definida pela rota POST /answers/:questionId',
  })
  questionId: number;
}
