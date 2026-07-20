// class-validator's @IsOptional() only exempts undefined/null — an empty
// string still hits @IsEmail()/@IsUrl() and gets rejected. Blank optional
// form fields must be sent as undefined (omitted), not "".
export function omitEmptyStrings<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(obj)) {
    (result as Record<string, unknown>)[key] = value === "" ? undefined : value;
  }
  return result;
}
