/** @internal */
declare const Object: {
  getPrototypeOf<T>(o: T): T;
  getOwnPropertyNames<T>(o: T): Array<keyof T>;
} & ObjectConstructor;


/**
 * Re-bind those functions that are bound to source object.
 * @param self - object to use as `this` argument.
 * @param source - object providing functions to bind.
 */
export function rebind<T>(self: T, source: T): void {
  for (const key of Object.getOwnPropertyNames(source)) {
    const func: Closure = source[key] as any;
    if (func && func.__this__ === source)
      self[key] = bind(func as any, self);
  }
}

/**
 * Binds invocation of every function from the source object using its {@link Object.getOwnPropertyNames own property names}.
 * Does nothing when {@param source} is not a {@link isUserPrototype user prototype}.
 * Saves bound function by the same key as it's defined in source object.
 * @param self - object to use as `this` argument.
 * @param source - object providing functions to bind.
 * @returns object passed as an argument {@param self}.
 */
export function bindToSelf<T>(self: T, source: T = self): T {
  if (isUserPrototype(source))
    self = bindKeysToSelf(self, Object.getOwnPropertyNames(source), source);
  return self;
}

/**
 * Binds invocation of every function from the source object by the provided keys.
 * @param self - object to use as `this` argument.
 * @param keys - array of function names to bind.
 * @param source - object providing functions to bind.
 * @returns object passed as an argument {@param self}.
 * @see bindKey
 */
export function bindKeysToSelf<T>(self: T, keys: Array<keyof T>, source: T = self): T {
  for (const key of keys)
    bindKey(self, key, source);
  return self;
}

/**
 * Bind invocation of a function defined by the key in a source object.
 * Saves target function in the bound function to allow rebinding it later.
 * @param object - object to use as `this` argument.
 * @param key - name of property containing function to bind.
 * @param source - object providing function to bind.
 * @returns true when source provides a user function eligible for binding; false otherwise.
 */
export function bindKey<T>(object: T, key: keyof T, source: T = object): boolean {
  if (isUserFunction(source, key)) {
    object[key] = bind(source[key], object);
    return true;
  }
}

/**
 * Check if object contains a function by the given property name.
 * @param object - object containing a property to check.
 * @param key - name of the property to check.
 * @returns true if property is a function and not a constructor.
 */
export function isUserFunction<T, K extends keyof T>(object: T, key: K): object is T & Record<K, Function> {
  return typeof object[key] === "function"
    && object[key] as any !== object.constructor;
}

/**
 * Check if the prototype could be defined by a user (not well known core prototype).
 * Assumes that {@link Object.prototype} and {@link Function.prototype} are core prototypes.
 * @param prototype - object instance to check.
 */
export function isUserPrototype(prototype: any): boolean {
  return prototype !== Object.prototype
    && prototype !== Function.prototype;
}

type Closure<T extends Function = Function> = {
  readonly name: string;
  readonly __this__?: any;
  readonly __function__?: T;
}

const descriptors: Record<keyof Closure, PropertyDescriptor> = {
  name: {writable: false, value: null},
  __this__: {writable: false, value: null},
  __function__: {writable: false, value: null},
};

function bind<T extends Function>(func: T & Closure<T>, that: any): T & Closure<T> {
  if (func.__this__ !== that) {
    func = func.__function__ || func;
    descriptors.__this__.value = that;
    descriptors.__function__.value = func;
    descriptors.name.value = toClosureName(func.name);
    func = Object.defineProperties(func.bind(that), descriptors);
  }
  return func;
}

function toClosureName(name: string) {
  return name ? `[closure] ${name}` : "[closure]";
}
