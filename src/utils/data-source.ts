import 'reflect-metadata';
import { DataSource, DataSourceOptions, EntityTarget, ObjectLiteral, Repository } from 'typeorm';
import path from 'path';
import { User } from '@/entities/User';
import { StudyRecord } from '@/entities/StudyRecord';
import { StudyRecordLike } from '@/entities/StudyRecordLike';

const dbUrl = process.env.POSTGRES_URL;

export const AppDataSource = new DataSource(
    (process.env.DB_HOST
        ? {
              type: 'mysql', // TiDBはMySQL互換のためmysqlを指定
              host: process.env.DB_HOST,
              port: Number(process.env.DB_PORT),
              username: process.env.DB_USERNAME,
              password: process.env.DB_PASSWORD,
              database: process.env.DB_DATABASE,
              logging: false,
              entities: [User, StudyRecord, StudyRecordLike],
              synchronize: true,
              ssl: {
                  rejectUnauthorized: true, // TiDB Cloud接続に必須
              },
          }
        : {
              type: 'better-sqlite3',
              database: path.join(process.cwd(), 'database.sqlite'),
              logging: false,
              entities: [User, StudyRecord, StudyRecordLike],
              synchronize: true,
          }) as DataSourceOptions
);

let initializedDataSource: DataSource | null = null;

export const getDataSource = async (): Promise<DataSource> => {
    if (initializedDataSource && initializedDataSource.isInitialized ){
        return initializedDataSource;
    }

    if (!AppDataSource.isInitialized) {
        initializedDataSource = await AppDataSource.initialize();
    } else {
        initializedDataSource = AppDataSource;
    }

    return initializedDataSource;
}

export const getRepository = async <T extends ObjectLiteral> (
    entity: EntityTarget<T>
): Promise<Repository<T>> => {
    const dataSource = await getDataSource();
    return dataSource.getRepository(entity);
};