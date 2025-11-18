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
export class Job {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ type: "int" })
  maxHP: number

  @Column({ type: "int" })
  maxMP: number

  @Column({ type: "int" })
  maxAP: number

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date | null
}
