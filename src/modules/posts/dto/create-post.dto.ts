import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { LocationArea } from './location-area.enum';
import { PopupCategory } from './popup-category.enum';

export class CreatePostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  location!: string;

  @IsEnum(LocationArea)
  area!: LocationArea;

  @IsEnum(PopupCategory)
  category!: PopupCategory;

  @IsOptional()
  @ValidateIf((_, v) => v !== '' && v != null)
  @IsUrl()
  imageUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  isKv?: boolean;
}
