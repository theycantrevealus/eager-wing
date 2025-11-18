import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  OneToMany,
} from "typeorm"
import { Item } from "./item.model"

@Entity()
export class ItemCraft {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(() => Item, (item) => item.id)
  item: Item

  @OneToMany(() => Item, (item) => item.id)
  need: Item

  @Column({ type: "int", comment: "Item qty needed" })
  qty: number

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date | null
}
