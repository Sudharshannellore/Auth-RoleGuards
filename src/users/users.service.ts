/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(
    registerDto: RegisterUserDto,
    saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  ) {
    const existing = await this.userModel.findOne({ email: registerDto.email });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(registerDto.password, saltRounds);

    const created = new this.userModel({
      ...registerDto,
      password: hashed,
    });

    return (await created.save()).toObject();
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  findAll() {
    return this.userModel.find();
  }
}
