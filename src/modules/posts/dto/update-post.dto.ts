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

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsEnum(LocationArea)
  area?: LocationArea;

  @IsOptional()
  @IsEnum(PopupCategory)
  category?: PopupCategory;

  /** 빈 문자열은 이미지 제거(null)용으로 허용 */
  @IsOptional()
  @ValidateIf((_, v) => v !== '' && v != null)
  @IsUrl()
  imageUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  isKv?: boolean;
}
