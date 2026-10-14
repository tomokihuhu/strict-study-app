import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import type { User } from './User';
import type { StudyRecord } from './StudyRecord';

@Entity('study_record_likes')
export class StudyRecordLike {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne('User', (user: User) => user.likes)
    @JoinColumn({
    name: 'userId' })
    user!: User;

    @ManyToOne('StudyRecord', (record: StudyRecord) => record.likes)
    @JoinColumn({ name: 'studyRecordId' })
    studyRecord!: StudyRecord;

    @CreateDateColumn()
    createdAt!: Date;
}