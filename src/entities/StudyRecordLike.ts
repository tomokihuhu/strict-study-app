import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, type Relation

 } from 'typeorm';
import { User } from './User';
import { StudyRecord } from './StudyRecord';

@Entity('study_record_likes')
export class StudyRecordLike {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (user: User) => user.likes)
    @JoinColumn({ name: 'userId' })
    user!: Relation<User>

    @ManyToOne(() => StudyRecord, (record: StudyRecord) => record.likes)
    @JoinColumn({ name: 'studyRecordId' })
    studyRecord!: Relation<StudyRecord>;

    @CreateDateColumn()
    createdAt!: Date;
}