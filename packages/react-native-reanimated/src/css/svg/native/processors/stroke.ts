'use strict';
import type { NumberProp } from 'react-native-svg';

import type { ValueProcessor } from '../../../../common';
import { isLength } from '../../../utils';

export const ERROR_MESSAGES = {
  invalidDashArray: (value: unknown) =>
    `Invalid stroke dash array value: ${JSON.stringify(value)}`,
};

export const processStrokeDashArray: ValueProcessor<
  NumberProp | readonly NumberProp[],
  (number | string)[] | 'none'
> = (value) => {
  let result: NumberProp[] = [];

  if (isLength(value)) {
    result = [value];
  } else if (Array.isArray(value)) {
    result = [...value];
  } else if (value === 'none') {
    return 'none';
  } else {
    throw new Error(`[Reanimated] ${ERROR_MESSAGES.invalidDashArray(value)}`);
  }

  // SVG spec: "If an odd number of values is provided, then the list of values
  // is repeated to yield an even number of values." A single value `n` thus
  // becomes `n n`. We have to do this here (react-native-svg's own extractStroke
  // does the same) because the animated value bypasses that path - and an
  // odd-length dash array crashes android's DashPathEffect (it throws when
  // intervals.length < 2).
  // https://www.w3.org/TR/fill-stroke-3/#valdef-stroke-dasharray-length-percentage
  if (result.length % 2 === 1) {
    result = result.concat(result);
  }

  if (__DEV__) {
    isValidDashArray(result);
  }

  return result;
};

const isValidDashArray = (value: NumberProp[]) => {
  if (!value.every(isLength)) {
    throw new Error(`[Reanimated] ${ERROR_MESSAGES.invalidDashArray(value)}`);
  }
};
