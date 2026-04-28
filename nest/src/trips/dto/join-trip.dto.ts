import { IsString, Length } from 'class-validator';

export class JoinTripDto {
  @IsString()
  @Length(4, 16)
  code!: string;
}
