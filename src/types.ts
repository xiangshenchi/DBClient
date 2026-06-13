export type DBType = 'mysql' | 'postgres';

export interface DBConnection {
  id: string;
  name: string;
  type: DBType;
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  ssl: boolean;
  lastConnected?: number;
}

export interface ColumnDetail {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
}

export interface TableStructure {
  [tableName: string]: ColumnDetail[];
}

export interface QueryResult {
  success: boolean;
  rows?: any[];
  count?: number;
  ms?: number;
  error?: string;
}

export interface PingResult {
  success: boolean;
  ms?: number;
  error?: string;
}

export interface StructureResult {
  success: boolean;
  structure?: TableStructure;
  error?: string;
}
