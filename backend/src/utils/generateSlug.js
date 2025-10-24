import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

export const generateSlug = () => {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    style: "lowerCase",
  });
};
// e.g., "happy-red-fox"
