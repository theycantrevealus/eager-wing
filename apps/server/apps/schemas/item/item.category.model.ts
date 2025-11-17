import { ITEM_CATEGORY } from "@constants/item.category"
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from "typeorm"

export class ItemCategory {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ type: "enum", enum: ITEM_CATEGORY })
  group: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date | null
}
