import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import qs from "query-string"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatAndDivideNumber = (num: number): string => {
  if (num >= 1000000) {
    const formattedNum = (num / 1000000).toFixed(1);
    return `${formattedNum}M`;
  } else if (num >= 1000) {
    const formattedNum = (num / 1000).toFixed(1);
    return `${formattedNum}K`;
  } else {
    return num.toString();
  }
};


interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
}

export const formUrlQuery = ({
  params,
  key,
  value,
}: UrlQueryParams) => {

  const query = qs.parse(params);
  query[key] = value;
  return qs.stringifyUrl({ url: window.location.pathname, query }, { skipNull: true });
}

interface RemoveUrlQueryParams {
  params: string;
  keysToRemove: string[];
}

export const removeKeysFromQuery = ({ params, keysToRemove}: RemoveUrlQueryParams) => {
  const currentUrl = qs.parse(params);

  keysToRemove.forEach((key) => {
    delete currentUrl[key];
  })

  return qs.stringifyUrl({
    url: window.location.pathname,
    query: currentUrl,
  },
  { skipNull: true})
}

// fraction simplification
const gcd = (a: number, b: number): number => {
  // console.log(a, b)
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b);
}

// cm to inch, with fraction at the end, e.g., 1 1/8 inch, 1 1/4 inch, etc
// 分数需要化简， 取最接近的那个分数即可, if it is 2/8, write it as 1/4, do not write 2/8 etc.
// go to the closest fraction, e.g., 1 1/8 inch, 1 1/4 inch, etc
// no ft, just inch
export const cmToInch = (cm: number): string => {
  const inch = cm / 2.54;
  const wholeInch = Math.floor(inch);
  const fraction = inch - wholeInch;
  const fractionInch = Math.round(fraction * 8);
  if (fractionInch === 8) {
    return `${wholeInch + 1}"`;
  } else if (fractionInch === 0) {
    return `${wholeInch}"`;
  } else {
    const gcdValue = gcd(fractionInch, 8);
    return `${wholeInch} ${fractionInch / gcdValue}/${8 / gcdValue}"`;
  }
}


export const getInch = (height: number, width: number): string => {
  return `${cmToInch(height)} x ${cmToInch(width)}`;
}

export const toTitleCase = (str: string) => {
  return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
}

