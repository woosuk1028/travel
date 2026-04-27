import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  findByEmail(email: string) {
    return this.users.findOne({ where: { email } });
  }

  findById(id: number) {
    return this.users.findOne({ where: { id } });
  }

  create(input: { email: string; name: string; passwordHash: string }) {
    const user = this.users.create(input);
    return this.users.save(user);
  }
}
