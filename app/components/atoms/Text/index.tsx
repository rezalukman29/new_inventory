

import clsxm from '@/app/util/clsxm';
import {
  FontWeightType,
  TextAlignType,
  TextColorType,
  TextProps,
  TextTransformType,
  TextVariantType,
} from './Text.type';

const fontSizeMapper: Record<TextVariantType, string> = {
  'extra-large': 'text-4xl',
  'ultra-large': 'text-2xl',
  large: 'text-lg',
  base: 'text-base',
  medium: 'text-sm',
  small: 'text-xs',
  'extra-small': 'text-xs',
};

export const fontWeightMapper: Record<FontWeightType, string> = {
  'extra-bold': 'font-extrabold',
  bold: 'font-bold',
  'semi-bold': 'font-semibold',
  regular: 'font-medium',
  normal: 'font-normal',
  light: 'font-light',
  thin: 'font-thin',
};

const fontColorMapper: Record<TextColorType, string> = {
  main: 'text-gray-900 dark:text-white',
  primary: 'text-gray-700 dark:text-gray-400',
  secondary: 'text-blue-600 dark:text-blue-300',
  disabled: 'text-gray-700 dark:text-gray-400',
  black: 'text-black dark:text-black',
  gray: 'text-gray-400',
  white: 'text-white dark:text-white',
  danger: 'text-red-500',
  warning: `text-[#EF9533]`,
  active: 'text-[#30A8BE]',
};

const fontTransformMapper: Record<TextTransformType, string> = {
  none: 'normal-case',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
};

const fontAlignMapper: Record<TextAlignType, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

export const Text = (props: TextProps) => {
  return (
    <p
      className={clsxm(
        fontSizeMapper[props.variant as keyof typeof fontSizeMapper] ||
          'text-sm',
        fontWeightMapper[props.fontWeight as keyof typeof fontWeightMapper] ||
          'font-normal',
        fontColorMapper[props.color as keyof typeof fontColorMapper] ||
          'text-gray-900 dark:text-gray-200',
        fontTransformMapper[
          props.textTransform as keyof typeof fontTransformMapper
        ] || 'normal-case',
        fontAlignMapper[props.textAlign as keyof typeof fontAlignMapper] ||
          'text-left',
        props.className
      )}
      style={props.style}
    >
      {props.label}
    </p>
  );
};
