import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm"

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  name: string

  @Column({ type: "char", length: 2, unique: true })
  iso_2_digit: string

  @Column({ type: "char", length: 3, unique: true })
  iso_3_digit: string

  @Column({ type: "string", length: 3, unique: true })
  phoneCode: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date | null
}
