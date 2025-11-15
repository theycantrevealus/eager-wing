import type { CharacterAttribute } from "#types/Character"

export const LAB_CHARACTER: Map<
  string,
  {
    attribute: CharacterAttribute
    object: string
    allowMovement: boolean
  }
> = new Map([
  [
    "mainPlayer",
    {
      allowMovement: true,
      object: "character",
      attribute: {
        modelId: "001",
        information: {
          name: "TATANG 1",
          gender: "female",
          level: 1,
          health: 100,
          mana: 100,
          job: "warrior",
          race: "asmodian",
          dimension: {
            scale: 1,
          },
        },
        position: {
          x: 0,
          y: 20,
          z: 0,
        },
        style: {
          body: {
            color: "#ffc095",
            hair: {
              color: "#ffc095",
            },
            brow: {
              color: "#ffc095",
            },
            eye: {
              color: "",
              scale: 0,
            },
            blush: {
              color: "",
            },
            lip: {
              color: "#ff0000",
            },
          },
        },
        speed: 0.1,
        turnSpeed: 0.5,
        classConfig: {
          needDebug: false,
        },
      },
    },
  ],
  [
    "secondPlayer",
    {
      allowMovement: false,
      object: "character",
      attribute: {
        modelId: "002",
        information: {
          name: "TANIA",
          gender: "female",
          level: 1,
          health: 100,
          mana: 100,
          job: "warrior",
          race: "elyos",
          dimension: {
            scale: 0.005,
          },
        },
        position: {
          x: 5,
          y: 0,
          z: 5,
        },
        style: {
          body: {
            color: "#ffc095",
            hair: {
              color: "#ffc095",
            },
            brow: {
              color: "#ffc095",
            },
            eye: {
              color: "",
              scale: 0,
            },
            blush: {
              color: "",
            },
            lip: {
              color: "#ff0000",
            },
          },
        },
        speed: 0.1,
        turnSpeed: 0.5,
        classConfig: {
          needDebug: false,
        },
      },
    },
  ],
])
