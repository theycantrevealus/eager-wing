import { Map } from "@schemas/map/map.model"
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

@Entity()
export class NPC {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @OneToMany(() => Map, (map) => map.id)
  map: Map

  @Column({ type: "int", comment: "Coordinate x" })
  x: number

  @Column({ type: "int", comment: "Coordinate y" })
  y: number

  @Column({ type: "int", comment: "Coordinate z" })
  z: number

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt: Date | null
}
