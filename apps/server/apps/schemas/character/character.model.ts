import { Account } from "@schemas/account/account.model"
import { Job } from "@schemas/job/job.model"
import { Level } from "@schemas/level/level.model"
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm"

@Entity()
export class Character {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  nickName: string

  @OneToOne(() => Level, (level) => level.id)
  level: Level

  @Column({ type: "int" })
  experience: number

  @Column({ type: "int" })
  maxHP: number

  @Column({ type: "int" })
  maxMP: number

  @Column({ type: "int" })
  maxAP: number

  @OneToOne(() => Job, (job) => job.id)
  job: Job

  /** CHECK POINT */

  @OneToOne(() => Account, (account) => account.id)
  account: Account

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date | null
}
