import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { User as UserModel } from '../generated/prisma/client';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  async signupUser(
    @Body(new ValidationPipe()) CreateUserDto: CreateUserDto,
  ): Promise<UserModel> {
    return this.userService.createUser(CreateUserDto);
  }
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  async getUser(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Omit<UserModel, 'password'> | null> {
    return this.userService.user({ id: Number(id) });
  }
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  async updateUser(
    @Body(new ValidationPipe()) userData: UpdateUserDto,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserModel> {
    return this.userService.updateUser({
      where: { id },
      data: userData,
    });
  }
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number): Promise<UserModel> {
    return this.userService.deleteUser({ id });
  }
}
