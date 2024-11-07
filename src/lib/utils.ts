import { type ClassValue, clsx } from "clsx";
import { differenceInSeconds, format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// create small library to intract with localstroage and session storage

const prefixKey = "v0"
export function local(
  type: "json" | "string" = "string",
  prefix: string = prefixKey
) {
  return {
    update: (key: string, value: string | object | boolean) => {
      const currentValue = local('json', prefix).get(key)
      if (currentValue === null) {
        return local('json', prefix).set(key, value)
      }
      window.localStorage.setItem(`${prefix}:${key}`, JSON.stringify(value))
    },
    get: (key: string) => {
      const value = window.localStorage.getItem(`${prefix}:${key}`)


      if (value === null) {
        return null
      }
      if (type === "json") return JSON.parse(value)

      return value
    },
    set: (key: string, value: string | object | boolean) => {
      if (type === "json") {

        const stringValue = JSON.stringify(value)
        return window.localStorage.setItem(`${prefix}:${key}`, stringValue)
      }
      window.localStorage.setItem(`${prefix}:${key}`, JSON.stringify(value))
    },
    remove: (key: string) => window.localStorage.removeItem(`${prefix}:${key}`),
    clear: () => window.localStorage.clear(),
  }
}

export function sessionStorage(
  type: "json" | "string" = "string",
  prefix: string = prefixKey
) {
  return {
    get: (key: string) => {
      const value = window.sessionStorage.getItem(`${prefix}:${key}`)
      if (value === null) {
        return null
      }
      if (type === "json") return JSON.parse(value)

      return value
    },
    set: (key: string, value: string) =>
      window.sessionStorage.setItem(`${prefix}:${key}`, value),
    remove: (key: string) =>
      window.sessionStorage.removeItem(`${prefix}:${key}`),
    clear: () => window.sessionStorage.clear(),
  }
}

export const getFileExtension = (lang: string): string => {
  switch (lang.toLowerCase()) {
    case "javascript":
      return "js"
    case "typescript":
      return "ts"
    case "python":
      return "py"
    case "java":
      return "java"
    case "c":
      return "c"
    case "cpp":
      return "cpp"
    case "html":
      return "html"
    default:
      return "txt"
  }
}

export const formatTimestamp = (timestamp: string | number | Date): string => {
  let date: Date;

    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else if (typeof timestamp === 'string') {
      date = parseISO(timestamp);
    } else {
      return '';
    }

  if (!isValid(date)) {
    return '';
  }

  return format(date, 'HH:mm');
};


interface DurationResult {
  duration: string;
  dateAndTime: string;
}

export const getDuration = (currentTimestamp: string | number | Date, previousTimestamp?: string | number | Date): DurationResult => {
  let currentDate: Date;
  let previousDate: Date;

  if (!currentTimestamp) {
    return { duration: "just now", dateAndTime: "" };
  }

  // Convert currentTimestamp to Date object
  if (typeof currentTimestamp === 'string') {
    currentDate = parseISO(currentTimestamp);
  } else if (typeof currentTimestamp === 'number') {
    currentDate = new Date(currentTimestamp);
  } else {
    currentDate = currentTimestamp;
  }

  // If previousTimestamp is not provided, use current date
  if (!previousTimestamp) {
    previousDate = new Date();
  } else {
    // Convert previousTimestamp to Date object
    if (typeof previousTimestamp === 'string') {
      previousDate = parseISO(previousTimestamp);
    } else if (typeof previousTimestamp === 'number') {
      previousDate = new Date(previousTimestamp);
    } else {
      previousDate = previousTimestamp;
    }
  }

  // Ensure currentDate is earlier than previousDate
  if (currentDate > previousDate) {
    [currentDate, previousDate] = [previousDate, currentDate];
  }

  // Calculate the difference in seconds
  const diffInSeconds = differenceInSeconds(previousDate, currentDate);

  // Generate the duration string
  let duration: string;
  if (diffInSeconds < 30) {
    duration = "just now";
  } else {
    duration = formatDistanceToNow(currentDate, { addSuffix: true });
  }

  // Format the date and time
  const dateAndTime = format(currentDate, 'PPpp'); // e.g., "Apr 29, 2023, 1:30 PM"

  return { duration, dateAndTime };
};


export const buildCurrentUserObject = (
  { userName, userId, personaColor }: { userName: string, userId: string, personaColor?: string }
) => {
   const userObject = {
    fullName: userName,
    userId,
    userName,
    timestamp: Date.now(),
    color: personaColor || "#" + Math.floor(Math.random() * 16777215).toString(16),
    isTyping: false,
    messages: [
        { userName: "User1", userId: "xxxxxx1", text: "Hello", timestamp: new Date().toISOString() },
      { userName: "User2", userId: "xxxxxx2", text: "Hello", timestamp: new Date().toISOString() },
    ],
    cursorPosition: { line: 0, column: 0 },
   };

  return userObject;
}

export const getCurrentTimeStamp = <T extends string | Date>(): T => {
  return Date.now() as unknown as T;
}


export const getCurrentUser = (sessionId: string | undefined) => {


  if (!sessionId) return null
  const sessionData =
    local("json", "key").get(`sessionIdentifier-${sessionId}`) || {}
  const { guestIdentifier } = sessionData
  return guestIdentifier
};


export const getUnitsToMinutes = (units: number) => {
  return units * 60 * 1000;
}