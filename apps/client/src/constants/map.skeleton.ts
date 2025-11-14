/**
 * Universal Blender Term Code
 * DEF  : Deforms mesh
 * CTRL : Animator control
 * MCH  : Mechanism bones
 * ORG  : Original setup
 */

export const SKELETON_MAP: {
  [gender: string]: {
    [key: string]: {
      identifier: string
      group?: string
      name?: string
      configurable?: boolean
    }
  }
} = {
  female: {
    /** [S1–Co4] Sacrum & Coccyx */
    "DEF-spine": {
      identifier: "SPINE001",
      name: "[S1–Co4] Sacrum & Coccyx",
      group: "body",
      configurable: false,
    },

    /** [L3–L5] Lower Lumbar */
    "DEF-spine.001": {
      identifier: "SPINE002",
      name: "[L3–L5] Lower Lumbar",
      group: "body",
      configurable: false,
    },

    /** [L1–L2] Upper Lumbar */
    "DEF-spine.002": {
      identifier: "SPINE003",
      name: "[L1–L2] Upper Lumbar",
      group: "body",
      configurable: false,
    },

    /** [T9–T12] Lower Thoracic */
    "DEF-spine.003": {
      identifier: "SPINE004",
      name: "[T9–T12] Lower Thoracic",
      group: "body",
      configurable: false,
    },

    /** [T5–T8] Mid Thoracic */
    "DEF-spine.004": {
      identifier: "SPINE005",
      name: "[T5–T8] Mid Thoracic",
      group: "body",
      configurable: false,
    },

    /** [T1–T4] Upper Thoracic */
    "DEF-spine.005": {
      identifier: "SPINE006",
      name: "[T1–T4] Upper Thoracic",
      group: "body",
      configurable: false,
    },

    /** [C1–C7] Cervical */
    "DEF-spine.006": {
      identifier: "SPINE007",
      name: "[C1–C7] Cervical",
      group: "body",
      configurable: false,
    },

    /** Pelvis */
    "DEF-pelvis.L": {
      identifier: "PELVIS001__LEFT",
      name: "Pelvis Left",
      group: "body",
      configurable: true,
    },
    "DEF-pelvis.R": {
      identifier: "PELVIS001__RIGHT",
      name: "Pelvis Right",
      group: "body",
      configurable: true,
    },

    /** Thigh */
    "DEF-thigh.L": { identifier: "THIGH001__LEFT" },
    "DEF-thigh.L.001": { identifier: "THIGH002__LEFT" },
    "DEF-thigh.R": { identifier: "THIGH001__RIGHT" },
    "DEF-thigh.R.001": { identifier: "THIGH002__RIGHT" },

    /** Shin */
    "DEF-shin.L": { identifier: "SHIN001__LEFT" },
    "DEF-shin.L.001": { identifier: "SHIN002__LEFT" },
    "DEF-shin.R": { identifier: "SHIN001__RIGHT" },
    "DEF-shin.R.001": { identifier: "SHIN002__RIGHT" },

    /** Foot */
    "DEF-foot.L": { identifier: "FOOT001__LEFT" },
    "DEF-foot.R": { identifier: "FOOT001__RIGHT" },

    /** Toe */
    "DEF-toe.L": { identifier: "TOE001__LEFT" },
    "DEF-toe.R": { identifier: "TOE001__RIGHT" },

    /** Forehead */
    "DEF-forehead.L": { identifier: "FOREHEAD001__LEFT" },
    "DEF-forehead.L.001": { identifier: "FOREHEAD002__LEFT" },
    "DEF-forehead.L.002": { identifier: "FOREHEAD003__LEFT" },
    "DEF-forehead.R": { identifier: "FOREHEAD001__RIGHT" },
    "DEF-forehead.R.001": { identifier: "FOREHEAD002__RIGHT" },
    "DEF-forehead.R.002": { identifier: "FOREHEAD003__RIGHT" },

    /** Temple */
    "DEF-temple.L": { identifier: "TEMPLE001__LEFT" },
    "DEF-temple.R": { identifier: "TEMPLE001__RIGHT" },

    /** Brow */
    "DEF-brow.B.L": { identifier: "BROW001__BOTTOM_LEFT" },
    "DEF-brow.B.L.001": { identifier: "BROW002__BOTTOM_LEFT" },
    "DEF-brow.B.L.002": { identifier: "BROW003__BOTTOM_LEFT" },
    "DEF-brow.B.L.003": { identifier: "BROW004__BOTTOM_LEFT" },
    "DEF-brow.B.R": { identifier: "BROW001__BOTTOM_RIGHT" },
    "DEF-brow.B.R.001": { identifier: "BROW002__BOTTOM_RIGHT" },
    "DEF-brow.B.R.002": { identifier: "BROW003__BOTTOM_RIGHT" },
    "DEF-brow.B.R.003": { identifier: "BROW004__BOTTOM_RIGHT" },
    "DEF-brow.T.L": { identifier: "BROW001__TOP_LEFT" },
    "DEF-brow.T.L.001": { identifier: "BROW002__TOP_LEFT" },
    "DEF-brow.T.L.002": { identifier: "BROW003__TOP_LEFT" },
    "DEF-brow.T.L.003": { identifier: "BROW004__TOP_LEFT" },
    "DEF-brow.T.R": { identifier: "BROW001__TOP_RIGHT" },
    "DEF-brow.T.R.001": { identifier: "BROW002__TOP_RIGHT" },
    "DEF-brow.T.R.002": { identifier: "BROW003__TOP_RIGHT" },
    "DEF-brow.T.R.003": { identifier: "BROW004__TOP_RIGHT" },

    /** Lid */
    "DEF-lid.B.L": {
      identifier: "LID001__BOTTOM_LEFT",
      name: "Lid Bottom Left 001",
      group: "head",
    },
    "DEF-lid.B.L.001": {
      identifier: "LID002__BOTTOM_LEFT",
      name: "Lid Bottom Left 002",
      group: "head",
    },
    "DEF-lid.B.L.002": { identifier: "LID003__BOTTOM_LEFT", group: "head" },
    "DEF-lid.B.L.003": { identifier: "LID004__BOTTOM_LEFT", group: "head" },
    "DEF-lid.T.L": { identifier: "LID001__TOP_LEFT", group: "head" },
    "DEF-lid.T.L.001": { identifier: "LID002__TOP_LEFT", group: "head" },
    "DEF-lid.T.L.002": { identifier: "LID003__TOP_LEFT", group: "head" },
    "DEF-lid.T.L.003": { identifier: "LID004__TOP_LEFT", group: "head" },
    "DEF-lid.B.R": { identifier: "LID001__BOTTOM_RIGHT", group: "head" },
    "DEF-lid.B.R.001": { identifier: "LID002__BOTTOM_RIGHT", group: "head" },
    "DEF-lid.B.R.002": { identifier: "LID003__BOTTOM_RIGHT", group: "head" },
    "DEF-lid.B.R.003": { identifier: "LID004__BOTTOM_RIGHT", group: "head" },
    "DEF-lid.T.R": { identifier: "LID001__TOP_RIGHT", group: "head" },
    "DEF-lid.T.R.001": { identifier: "LID002__TOP_RIGHT", group: "head" },
    "DEF-lid.T.R.002": { identifier: "LID003__TOP_RIGHT", group: "head" },
    "DEF-lid.T.R.003": { identifier: "LID004__TOP_RIGHT", group: "head" },

    /** Ear */
    "DEF-ear.L": { identifier: "EAR001__LEFT" },
    "DEF-ear.L.001": { identifier: "EAR002__LEFT" },
    "DEF-ear.L.002": { identifier: "EAR003__LEFT" },
    "DEF-ear.L.003": { identifier: "EAR004__LEFT" },
    "DEF-ear.L.004": { identifier: "EAR005__LEFT" },
    "DEF-ear.R": { identifier: "EAR001__RIGHT" },
    "DEF-ear.R.001": { identifier: "EAR002__RIGHT" },
    "DEF-ear.R.002": { identifier: "EAR003__RIGHT" },
    "DEF-ear.R.003": { identifier: "EAR004__RIGHT" },
    "DEF-ear.R.004": { identifier: "EAR005__RIGHT" },

    /** Tongue */
    "DEF-tongue": { identifier: "TONGUE001" },
    "DEF-tongue.001": { identifier: "TONGUE002" },
    "DEF-tongue.002": { identifier: "TONGUE003" },

    /** Chin */
    "DEF-chin": { identifier: "CHIN001" },
    "DEF-chin.001": { identifier: "CHIN002" },
    "DEF-chin.L": { identifier: "CHIN001__LEFT" },
    "DEF-chin.R": { identifier: "CHIN001__RIGHT" },

    /** Jaw */
    "DEF-jaw": { identifier: "JAW001" },
    "DEF-jaw.L": { identifier: "JAW001__LEFT" },
    "DEF-jaw.L.001": { identifier: "JAW002__LEFT" },
    "DEF-jaw.R": { identifier: "JAW001__RIGHT" },
    "DEF-jaw.R.001": { identifier: "JAW002__RIGHT" },

    /** Cheek */
    "DEF-cheek.T.L": { identifier: "CHEEK001__TOP_LEFT" },
    "DEF-cheek.T.L.001": { identifier: "CHEEK002__TOP_LEFT" },
    "DEF-cheek.T.R": { identifier: "CHEEK001__TOP_RIGHT" },
    "DEF-cheek.T.R.001": { identifier: "CHEEK002__TOP_RIGHT" },
    "DEF-cheek.B.L": { identifier: "CHEEK001__BOTTOM_LEFT" },
    "DEF-cheek.B.L.001": { identifier: "CHEEK002__BOTTOM_LEFT" },
    "DEF-cheek.B.R": { identifier: "CHEEK001__BOTTOM_RIGHT" },
    "DEF-cheek.B.R.001": { identifier: "CHEEK002__BOTTOM_RIGHT" },

    /** Nose */
    "DEF-nose": { identifier: "NOSE001" },
    "DEF-nose.002": { identifier: "NOSE002" },
    "DEF-nose.001": { identifier: "NOSE003" },
    "DEF-nose.003": { identifier: "NOSE004" },
    "DEF-nose.004": { identifier: "NOSE005" },
    "DEF-nose.L": { identifier: "NOSE001__LEFT" },
    "DEF-nose.L.001": { identifier: "NOSE002__LEFT" },
    "DEF-nose.R": { identifier: "NOSE001__RIGHT" },
    "DEF-nose.R.001": { identifier: "NOSE002__RIGHT" },

    /** Lip */
    "DEF-lip.B.L": { identifier: "LIP001__BOTTOM_LEFT" },
    "DEF-lip.B.L.001": { identifier: "LIP002__BOTTOM_LEFT" },
    "DEF-lip.B.R": { identifier: "LIP001__BOTTOM_RIGHT" },
    "DEF-lip.B.R.001": { identifier: "LIP002__BOTTOM_RIGHT" },
    "DEF-lip.T.L": { identifier: "LIP001__TOP_LEFT" },
    "DEF-lip.T.L.001": { identifier: "LIP002__TOP_LEFT" },
    "DEF-lip.T.R": { identifier: "LIP001__TOP_RIGHT" },
    "DEF-lip.T.R.001": { identifier: "LIP002__TOP_RIGHT" },

    /** Shoulder */
    "DEF-shoulder.L": { identifier: "SHOULDER001__LEFT" },
    "DEF-shoulder.R": { identifier: "SHOULDER001__RIGHT" },

    /** Upper Arm */
    "DEF-upper_arm.L": { identifier: "UPPERARM001__LEFT" },
    "DEF-upper_arm.L.001": { identifier: "UPPERARM002__LEFT" },
    "DEF-upper_arm.R": { identifier: "UPPERARM001__RIGHT" },
    "DEF-upper_arm.R.001": { identifier: "UPPERARM002__RIGHT" },

    /** Forearm */
    "DEF-forearm.L": { identifier: "FOREARM001__LEFT" },
    "DEF-forearm.L.001": { identifier: "FOREARM002__LEFT" },
    "DEF-forearm.R": { identifier: "FOREARM001__RIGHT" },
    "DEF-forearm.R.001": { identifier: "FOREARM002__RIGHT" },

    /** Hand */
    "DEF-hand.L": { identifier: "HAND001__LEFT" },
    "DEF-hand.R": { identifier: "HAND001__RIGHT" },

    /** Palm */
    "DEF-palm.01.L": { identifier: "PALM001__LEFT" },
    "DEF-palm.02.L": { identifier: "PALM002__LEFT" },
    "DEF-palm.03.L": { identifier: "PALM003__LEFT" },
    "DEF-palm.04.L": { identifier: "PALM004__LEFT" },
    "DEF-palm.01.R": { identifier: "PALM001__RIGHT" },
    "DEF-palm.02.R": { identifier: "PALM002__RIGHT" },
    "DEF-palm.03.R": { identifier: "PALM003__RIGHT" },
    "DEF-palm.04.R": { identifier: "PALM004__RIGHT" },

    /** Thumb */
    "DEF-thumb.01.L": { identifier: "THUMB001__LEFT" },
    "DEF-thumb.02.L": { identifier: "THUMB002__LEFT" },
    "DEF-thumb.03.L": { identifier: "THUMB003__LEFT" },
    "DEF-thumb.01.R": { identifier: "THUMB001__RIGHT" },
    "DEF-thumb.02.R": { identifier: "THUMB002__RIGHT" },
    "DEF-thumb.03.R": { identifier: "THUMB003__RIGHT" },

    /** Index */
    "DEF-f_index.01.L": { identifier: "INDEX001__LEFT" },
    "DEF-f_index.02.L": { identifier: "INDEX002__LEFT" },
    "DEF-f_index.03.L": { identifier: "INDEX003__LEFT" },
    "DEF-f_index.01.R": { identifier: "INDEX001__RIGHT" },
    "DEF-f_index.02.R": { identifier: "INDEX002__RIGHT" },
    "DEF-f_index.03.R": { identifier: "INDEX003__RIGHT" },

    /** Middle */
    "DEF-f_middle.01.L": { identifier: "MIDDLE001__LEFT" },
    "DEF-f_middle.02.L": { identifier: "MIDDLE002__LEFT" },
    "DEF-f_middle.03.L": { identifier: "MIDDLE003__LEFT" },
    "DEF-f_middle.01.R": { identifier: "MIDDLE001__RIGHT" },
    "DEF-f_middle.02.R": { identifier: "MIDDLE002__RIGHT" },
    "DEF-f_middle.03.R": { identifier: "MIDDLE003__RIGHT" },

    /** Ring */
    "DEF-f_ring.01.L": { identifier: "RING001__LEFT" },
    "DEF-f_ring.02.L": { identifier: "RING002__LEFT" },
    "DEF-f_ring.03.L": { identifier: "RING003__LEFT" },
    "DEF-f_ring.01.R": { identifier: "RING001__RIGHT" },
    "DEF-f_ring.02.R": { identifier: "RING002__RIGHT" },
    "DEF-f_ring.03.R": { identifier: "RING003__RIGHT" },

    /** Pinky */
    "DEF-f_pinky.01.L": { identifier: "PINKY001__LEFT" },
    "DEF-f_pinky.02.L": { identifier: "PINKY002__LEFT" },
    "DEF-f_pinky.03.L": { identifier: "PINKY003__LEFT" },
    "DEF-f_pinky.01.R": { identifier: "PINKY001__RIGHT" },
    "DEF-f_pinky.02.R": { identifier: "PINKY002__RIGHT" },
    "DEF-f_pinky.03.R": { identifier: "PINKY003__RIGHT" },

    /** Breast */
    "DEF-breast.L": { identifier: "BREAST001__LEFT" },
    "DEF-breast.R": { identifier: "BREAST001__RIGHT" },
  },
}

export const SKELETON_METARIG_MAP = {
  name: "Spine",
  children: [
    {
      name: "Spine.001",
      children: [
        {
          name: "Spine.002",
          children: [
            {
              name: "Spine.003",
              children: [
                {
                  name: "Spine.004",
                  children: [
                    {
                      name: "Spine.005",
                      children: [
                        {
                          name: "Spine.006",
                          children: [
                            {
                              name: "Face",
                              children: [
                                {
                                  name: "Nose",
                                  children: [
                                    {
                                      name: "Nose.001",
                                      children: [
                                        {
                                          name: "Nose.002",
                                          children: [
                                            {
                                              name: "Nose.003",
                                              children: [
                                                {
                                                  name: "Nose.004",
                                                  children: [],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Lip.Top.Left",
                                  children: [
                                    { name: "Lip.Top.Left.001", children: [] },
                                  ],
                                },
                                {
                                  name: "Lip.Top.Right",
                                  children: [
                                    {
                                      name: "Lip.Top.Right.001",
                                      children: [],
                                    },
                                  ],
                                },
                                {
                                  name: "Lip.Bottom.Left",
                                  children: [
                                    { name: "Lip.Bottom.Left", children: [] },
                                  ],
                                },
                                {
                                  name: "Lip.Bottom.Right",
                                  children: [
                                    {
                                      name: "Lip.Bottom.Right.001",
                                      children: [],
                                    },
                                  ],
                                },
                                {
                                  name: "Brow.Bottom.Left",
                                  children: [
                                    {
                                      name: "Brow.Bottom.Left.001",
                                      children: [
                                        {
                                          name: "Brow.Bottom.Left.002",
                                          children: [
                                            {
                                              name: "Brow.Bottom.Left.003",
                                              children: [],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Brow.Bottom.Right",
                                  children: [
                                    {
                                      name: "Brow.Bottom.Right.001",
                                      children: [
                                        {
                                          name: "Brow.Bottom.Right.002",
                                          children: [
                                            {
                                              name: "Brow.Bottom.Right.003",
                                              children: [],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Jaw",
                                  children: [
                                    {
                                      name: "Chin",
                                      children: [
                                        { name: "Chin.001", children: [] },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Ear.Left",
                                  children: [
                                    {
                                      name: "Ear.Left.001",
                                      children: [
                                        {
                                          name: "Ear.Left.002",
                                          children: [
                                            {
                                              name: "Ear.Left.003",
                                              children: [
                                                {
                                                  name: "Ear.Left.004",
                                                  children: [],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Ear.Right",
                                  children: [
                                    {
                                      name: "Ear.Right.001",
                                      children: [
                                        {
                                          name: "Ear.Right.002",
                                          children: [
                                            {
                                              name: "Ear.Right.003",
                                              children: [
                                                {
                                                  name: "Ear.Right.004",
                                                  children: [],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Lid.Top.Left",
                                  children: [
                                    {
                                      name: "Lid.Top.Left.001",
                                      children: [
                                        {
                                          name: "Lid.Top.Left.002",
                                          children: [
                                            {
                                              name: "Lid.Top.Left.003",
                                              children: [
                                                {
                                                  name: "Lid.Bottom.Left",
                                                  children: [
                                                    {
                                                      name: "Lid.Bottom.Left.001",
                                                      children: [
                                                        {
                                                          name: "Lid.Bottom.Left.002",
                                                          children: [
                                                            {
                                                              name: "Lid.Bottom.Left.003",
                                                              children: [],
                                                            },
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Lid.Top.Right",
                                  children: [
                                    {
                                      name: "Lid.Top.Right.001",
                                      children: [
                                        {
                                          name: "Lid.Top.Right.002",
                                          children: [
                                            {
                                              name: "Lid.Top.Right.003",
                                              children: [
                                                {
                                                  name: "Lid.Bottom.Right",
                                                  children: [
                                                    {
                                                      name: "Lid.Bottom.Right.001",
                                                      children: [
                                                        {
                                                          name: "Lid.Bottom.Right.002",
                                                          children: [
                                                            {
                                                              name: "Lid.Bottom.Right.003",
                                                              children: [],
                                                            },
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Forehead.Left",
                                  children: [
                                    {
                                      name: "Forehead.Left.001",
                                      children: [
                                        {
                                          name: "Forehead.Left.002",
                                          children: [
                                            {
                                              name: "Temple.Left",
                                              children: [
                                                {
                                                  name: "Jaw.Left",
                                                  children: [
                                                    {
                                                      name: "Chin.Left",
                                                      children: [
                                                        {
                                                          name: "Cheek.Bottom.Left",
                                                          children: [
                                                            {
                                                              name: "Cheek.Bottom.Left.001",
                                                              children: [
                                                                {
                                                                  name: "Brow.Top.Left",
                                                                  children: [
                                                                    {
                                                                      name: "Brow.Top.Left.001",
                                                                      children:
                                                                        [
                                                                          {
                                                                            name: "Brow.Top.Left.002",
                                                                            children:
                                                                              [
                                                                                {
                                                                                  name: "Brow.Top.Left.003",
                                                                                  children:
                                                                                    [],
                                                                                },
                                                                              ],
                                                                          },
                                                                        ],
                                                                    },
                                                                  ],
                                                                },
                                                              ],
                                                            },
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Forehead.Right",
                                  children: [
                                    {
                                      name: "Forehead.Right.001",
                                      children: [
                                        {
                                          name: "Forehead.Right.002",
                                          children: [
                                            {
                                              name: "Temple.Right",
                                              children: [
                                                {
                                                  name: "Jaw.Right",
                                                  children: [
                                                    {
                                                      name: "Chin.Right",
                                                      children: [
                                                        {
                                                          name: "Cheek.Bottom.Right",
                                                          children: [
                                                            {
                                                              name: "Cheek.Bottom.Right.001",
                                                              children: [
                                                                {
                                                                  name: "Brow.Top.Right",
                                                                  children: [
                                                                    {
                                                                      name: "Brow.Top.Right.001",
                                                                      children:
                                                                        [
                                                                          {
                                                                            name: "Brow.Top.Right.002",
                                                                            children:
                                                                              [
                                                                                {
                                                                                  name: "Brow.Top.Right.003",
                                                                                  children:
                                                                                    [],
                                                                                },
                                                                              ],
                                                                          },
                                                                        ],
                                                                    },
                                                                  ],
                                                                },
                                                              ],
                                                            },
                                                          ],
                                                        },
                                                      ],
                                                    },
                                                  ],
                                                },
                                              ],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Eye.Left",
                                  children: [],
                                },
                                {
                                  name: "Eye.Right",
                                  children: [],
                                },
                                {
                                  name: "Cheek.Top.Left",
                                  children: [
                                    {
                                      name: "Cheek.Top.Left.001",
                                      children: [
                                        {
                                          name: "Nose.Left",
                                          children: [
                                            {
                                              name: "Nose.Left.001",
                                              children: [],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Cheek.Top.Right",
                                  children: [
                                    {
                                      name: "Cheek.Top.Right.001",
                                      children: [
                                        {
                                          name: "Nose.Right",
                                          children: [
                                            {
                                              name: "Nose.Right.001",
                                              children: [],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Teeth.Top",
                                  children: [],
                                },
                                {
                                  name: "Teeth.Bottom",
                                  children: [],
                                },
                                {
                                  name: "Tongue",
                                  children: [
                                    {
                                      name: "Tongue.001",
                                      children: [
                                        {
                                          name: "Tongue.002",
                                          children: [],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Shoulder.Left",
                  children: [
                    {
                      name: "Upper.Arm.Left",
                      children: [
                        {
                          name: "Forearm.Left",
                          children: [
                            {
                              name: "Hand.Left",
                              children: [
                                {
                                  name: "Palm.Index.Left",
                                  children: [
                                    {
                                      name: "Finger.Index.01.Left",
                                      children: [
                                        {
                                          name: "Finger.Index.02.Left",
                                          children: [
                                            {
                                              name: "Finger.Index.03.Left",
                                              children: [],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                    {
                                      name: "Thumb.01.Left",
                                      children: [
                                        {
                                          name: "Thumb.02.Left",
                                          children: [
                                            {
                                              name: "Thumb.03.Left",
                                              children: [],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Palm.Middle.Left",
                                  children: [
                                    {
                                      name: "Finger.Middle.01.Left",
                                      children: [
                                        {
                                          name: "Finger.Middle.02.Left",
                                          children: [
                                            {
                                              name: "Finger.Middle.03.Left",
                                              children: [],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Palm.Ring.Left",
                                  children: [
                                    {
                                      name: "Finger.Ring.01.Left",
                                      children: [
                                        {
                                          name: "Finger.Ring.02.Left",
                                          children: [
                                            {
                                              name: "Finger.Ring.03.Left",
                                              children: [],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Palm.Pinky.Left",
                                  children: [
                                    {
                                      name: "Finger.Pinky.01.Left",
                                      children: [
                                        {
                                          name: "Finger.Pinky.02.Left",
                                          children: [
                                            {
                                              name: "Finger.Pinky.03.Left",
                                              children: [],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Shoulder.Right",
                  children: [
                    {
                      name: "Upper.Arm.Right",
                      children: [
                        {
                          name: "Forearm.Right",
                          children: [
                            {
                              name: "Hand.Right",
                              children: [
                                {
                                  name: "Palm.Index.Right",
                                  children: [
                                    {
                                      name: "Finger.Index.01.Right",
                                      children: [
                                        {
                                          name: "Finger.Index.02.Right",
                                          children: [
                                            {
                                              name: "Finger.Index.03.Right",
                                              children: [],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                    {
                                      name: "Thumb.01.Right",
                                      children: [
                                        {
                                          name: "Thumb.02.Right",
                                          children: [
                                            {
                                              name: "Thumb.03.Right",
                                              children: [],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Palm.Middle.Right",
                                  children: [
                                    {
                                      name: "Finger.Middle.01.Right",
                                      children: [
                                        {
                                          name: "Finger.Middle.02.Right",
                                          children: [
                                            {
                                              name: "Finger.Middle.03.Right",
                                              children: [],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Palm.Ring.Right",
                                  children: [
                                    {
                                      name: "Finger.Ring.01.Right",
                                      children: [
                                        {
                                          name: "Finger.Ring.02.Right",
                                          children: [
                                            {
                                              name: "Finger.Ring.03.Right",
                                              children: [],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  name: "Palm.Pinky.Right",
                                  children: [
                                    {
                                      name: "Finger.Pinky.01.Right",
                                      children: [
                                        {
                                          name: "Finger.Pinky.02.Right",
                                          children: [
                                            {
                                              name: "Finger.Pinky.03.Right",
                                              children: [],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  name: "Breast.Left",
                  children: [],
                },
                {
                  name: "Breast.Right",
                  children: [],
                },
              ],
            },
          ],
        },
        {
          name: "Pelvis.Left",
          children: [],
        },
        {
          name: "Pelvis.Right",
          children: [],
        },
        {
          name: "Thigh.Left",
          children: [
            {
              name: "Shin.Left",
              children: [
                {
                  name: "Foot.Left",
                  children: [
                    {
                      name: "Toe.Left",
                      children: [
                        {
                          name: "Heel.02.Left",
                          children: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          name: "Thigh.Right",
          children: [
            {
              name: "Shin.Right",
              children: [
                {
                  name: "Foot.Right",
                  children: [
                    {
                      name: "Toe.Right",
                      children: [
                        {
                          name: "Heel.02.Right",
                          children: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
