export type BaseColumnOptions<T> = {
  notNull?: boolean;
  unique?: boolean;
  default?: T;
};

export type StringColumnOptions = BaseColumnOptions<string> & {
  length?: number;
};

export type NumberColumnOptions = BaseColumnOptions<number> & {
  type?: 'smallint' | 'integer' | 'bigint';
  precision?: number;
  scale?: number;
  autoIncrement?: boolean;
};

export type BooleanColumnOptions = BaseColumnOptions<boolean> & {
};

export type DateColumnOptions = BaseColumnOptions<Date | string> & {
  mode?: 'string' | 'date';
  withTimezone?: boolean;
  precision?: number; 
};

export type JsonColumnOptions = BaseColumnOptions<any> & {
  mode?: 'json' | 'jsonb';
};

export type ArrayColumnOptions<T> = BaseColumnOptions<T[]> & {
  itemType: 'text' | 'integer' | 'boolean';
};

export type EnumColumnOptions<T extends string> = BaseColumnOptions<T> & {
  enumName: string;
  values: readonly T[];
};

export type ColumnOptions = 
  | StringColumnOptions 
  | NumberColumnOptions 
  | BooleanColumnOptions 
  | DateColumnOptions
  | JsonColumnOptions
  | ArrayColumnOptions<any>
  | EnumColumnOptions<any>;