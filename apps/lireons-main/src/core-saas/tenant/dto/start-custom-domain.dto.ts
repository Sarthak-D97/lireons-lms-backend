import { IsNotEmpty, IsString } from 'class-validator';

export class StartCustomDomainDto {
  @IsString()
  @IsNotEmpty()
  customDomain!: string;
}
