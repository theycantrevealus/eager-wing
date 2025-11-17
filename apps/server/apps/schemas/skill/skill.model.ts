import { Job } from "@schemas/job/job.model"
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from "typeorm"

@Entity()
export class Skill {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: "varchar", length: 16 })
  name: string

  @ManyToOne(() => Job, (job) => job.id)
  job: Job

  @Column({
    type: "int",
    default: 0,
    comment: "HP needed to cast current skill",
  })
  costHP: number

  @Column({
    type: "int",
    default: 0,
    comment: "MP needed to cast current skill",
  })
  costMP: number

  @Column({
    type: "int",
    default: 0,
    comment: "AP needed to cast current skill",
  })
  costAP: number

  @Column({
    type: "int",
    default: 0,
    comment: "Time needed to skill could be used next time in ms",
  })
  cooldown: number

  @Column({ type: "text" })
  desc: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date | null
}
