import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from 'src/generated/prisma/client';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async signin(
    params: Prisma.UserCreateInput,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userService.user({ email: params.email });
    if (!user) throw new NotFoundException('User not found');
    const passwordMatch = await bcrypt.compare(params.password, user.password);
    if (!passwordMatch) throw new NotFoundException('User not found');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }
}
