import { NPC } from "@schemas/npc/npc.model"
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  JoinColumn,
} from "typeorm"
import { ItemCategory } from "./item.category.model"
import { ItemCraft } from "./item.craft.recipe.model"

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @OneToMany(() => ItemCategory, (itemCategory) => itemCategory.id)
  category: ItemCategory

  @Column({ name: "buy_price", type: "int" })
  buyPrice: number

  @Column({ name: "sell_price", type: "int" })
  sellPrice: number

  @OneToMany(() => NPC, (npc) => npc.id)
  npc: NPC

  @Column({ name: "required_level_minimum", type: "int" })
  requiredLevelMinimum: number

  @Column({
    type: "int",
    comment: "Item stack count in inventory. For ex: potions",
  })
  stacked: number

  @OneToMany(() => ItemCraft, (craft) => craft.id, { onDelete: "CASCADE" })
  craft: ItemCraft[]

  @Column({ type: "text" })
  desc: string

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date | null
}
