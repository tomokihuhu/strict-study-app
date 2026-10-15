import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Relation
}  from 'typeorm';
import { StudyRecord } from './StudyRecord';
import { StudyRecordLike } from './StudyRecordLike';

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

    @OneToMany(() => StudyRecord, (studyRecord: StudyRecord) => studyRecord.user)
    studyRecords!: Relation<StudyRecord>[];

    @OneToMany(() => StudyRecordLike, (like: StudyRecordLike) => like.user)
    likes!: Relation<StudyRecordLike>[];
}