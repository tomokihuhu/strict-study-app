import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
}  from 'typeorm';
import type { StudyRecord } from './StudyRecord';
import type { StudyRecordLike } from './StudyRecordLike';

@Entity('user')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    userName!: string;

    @Column({ unique: true})
    email!: string;

    @Column()
    password!: string;

    @Column({ type: 'varchar', nullable: true})
    avatarUrl!: string | null;

    @Column({ type: 'varchar', length: 140, nullable: true })
    bio!: string | null;



    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany('StudyRecord', (studyRecord: StudyRecord) => studyRecord.user)
    studyRecords!: StudyRecord[];

    @OneToMany('StudyRecordLike', (like: StudyRecordLike) => like.user)
    likes!: StudyRecord[];
}