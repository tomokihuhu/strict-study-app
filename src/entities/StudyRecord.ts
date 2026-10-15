import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn,} from 'typeorm';
import { User } from './User';
import { StudyRecordLike } from './StudyRecordLike';

@Entity('study_records')
export class StudyRecord {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    subject!: string;

    @Column('int')
    duration!: number;

    @Column('boolean')
    isSuccess!: boolean;

    @Column('text', { nullable: true})
    memo!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @ManyToOne(() => User, (user: User) => user.studyRecords)
    @JoinColumn({ name: 'userId' })
    user!: User;

    @Column()
    userId!: number;

    @OneToMany(() => StudyRecordLike, (like: StudyRecordLike) => like.studyRecord)
    likes!: StudyRecordLike[];
}