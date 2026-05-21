/**
 * Patch: @types/react-native declares a minimal `FormData` class that is
 * missing the standard Web API `get`, `getAll(name)`, `set`, `delete`, and
 * `has` methods.  Re-declare the class here so server route handlers that
 * call `request.formData()` can use the full Web API surface.
 *
 * This declaration is merged with (not replacing) the existing one by the
 * TypeScript compiler because both live in the global scope.
 */
declare class FormData {
  get(name: string): FormDataEntryValue | null;
  getAll(name: string): FormDataEntryValue[];
  set(name: string, value: string | Blob, fileName?: string): void;
  delete(name: string): void;
  has(name: string): boolean;
  entries(): IterableIterator<[string, FormDataEntryValue]>;
  keys(): IterableIterator<string>;
  values(): IterableIterator<FormDataEntryValue>;
  forEach(
    callback: (value: FormDataEntryValue, key: string, parent: FormData) => void,
    thisArg?: unknown,
  ): void;
}
