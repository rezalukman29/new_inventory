import { ReactElement } from 'react';

export type FontWeightType =
  | 'extra-bold'
  | 'bold'
  | 'semi-bold'
  | 'regular'
  | 'normal'
  | 'light'
  | 'thin';
export type TextAlignType = 'left' | 'center' | 'right' | 'justify';
export type TextTransformType =
  | 'none'
  | 'capitalize'
  | 'uppercase'
  | 'lowercase';
export type TextVariantType =
  | 'extra-large'
  | 'ultra-large'
  | 'large'
  | 'base'
  | 'medium'
  | 'small'
  | 'extra-small';
export type TextColorType =
  | 'active'
  | 'main'
  | 'primary'
  | 'secondary'
  | 'disabled'
  | 'black'
  | 'gray'
  | 'white'
  | 'warning'
  | 'danger';

export interface TextStyleProps {
  fontWeight?: FontWeightType;
  color?: string;
  variant?: TextVariantType;
  textAlign?: TextAlignType;
  textTransform?: TextTransformType;
}

export interface TextProps extends TextStyleProps {
  label: string | ReactElement | null;
  className?: string;
}
