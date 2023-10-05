export const convertFlagNameToKey = (name: string) => {
  return name.toLowerCase().replace(/ /g, "-");
};
