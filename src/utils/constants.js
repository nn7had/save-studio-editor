// ─── XP → Level tablosu (ETS2 v1.50 baz)
// Index = level-1, değer = o levele ulaşmak için gereken toplam XP
export const XP_TABLE = [
       0,   // Lv 1
     500,   // Lv 2
    1500,   // Lv 3
    3000,   // Lv 4
    5500,   // Lv 5
    9000,   // Lv 6
   13500,   // Lv 7
   19000,   // Lv 8
   25500,   // Lv 9
   33000,   // Lv 10
   41500,   // Lv 11
   51000,   // Lv 12
   62000,   // Lv 13
   74000,   // Lv 14
   87500,   // Lv 15
  102500,   // Lv 16
  119000,   // Lv 17
  137000,   // Lv 18
  157000,   // Lv 19
  179000,   // Lv 20
  203000,   // Lv 21
  229500,   // Lv 22
  258500,   // Lv 23
  290000,   // Lv 24
  324000,   // Lv 25
  360500,   // Lv 26
  399500,   // Lv 27
  441500,   // Lv 28
  486000,   // Lv 29
  533500,   // Lv 30
  584000,   // Lv 31
  637500,   // Lv 32
  694500,   // Lv 33
  754500,   // Lv 34
  818000,   // Lv 35
  885000,   // Lv 36
  955500,   // Lv 37
 1029500,   // Lv 38
 1107000,   // Lv 39
 1188000,   // Lv 40
 1273000,   // Lv 41
 1362000,   // Lv 42
 1455000,   // Lv 43
 1552000,   // Lv 44
 1653000,   // Lv 45
 1758000,   // Lv 46
 1867000,   // Lv 47
 1980000,   // Lv 48
 2097000,   // Lv 49
 2218000,   // Lv 50
 2343000,   // Lv 51
 2472000,   // Lv 52
 2605000,   // Lv 53
 2742000,   // Lv 54
 2883000,   // Lv 55
 3028000,   // Lv 56
 3177000,   // Lv 57
 3330000,   // Lv 58
 3487000,   // Lv 59
 3648000,   // Lv 60
 3813000,   // Lv 61
 3982000,   // Lv 62
 4155000,   // Lv 63
 4332000,   // Lv 64
 4513000,   // Lv 65
 4698000,   // Lv 66
 4887000,   // Lv 67
 5080000,   // Lv 68
 5277000,   // Lv 69
 5478000,   // Lv 70
 5683000,   // Lv 71
 5892000,   // Lv 72
 6105000,   // Lv 73
 6322000,   // Lv 74
 6543000,   // Lv 75
 6768000,   // Lv 76
 6997000,   // Lv 77
 7230000,   // Lv 78
 7467000,   // Lv 79
 7708000,   // Lv 80
 7953000,   // Lv 81
 8202000,   // Lv 82
 8455000,   // Lv 83
 8712000,   // Lv 84
 8973000,   // Lv 85
 9238000,   // Lv 86
 9507000,   // Lv 87
 9780000,   // Lv 88
10057000,   // Lv 89
10338000,   // Lv 90
10623000,   // Lv 91
10912000,   // Lv 92
11205000,   // Lv 93
11502000,   // Lv 94
11803000,   // Lv 95
12108000,   // Lv 96
12417000,   // Lv 97
12730000,   // Lv 98
13047000,   // Lv 99
13368000,   // Lv 100
]

// ─── ADR sınıfları (bitmask, bit index = 0 tabanlı)
export const ADR_CLASSES = [
  { bit: 0, value: 1,  label: 'Class 1', desc: 'Explosives'        },
  { bit: 1, value: 2,  label: 'Class 2', desc: 'Gases'             },
  { bit: 2, value: 4,  label: 'Class 3', desc: 'Flammable liquids' },
  { bit: 3, value: 8,  label: 'Class 4', desc: 'Oxidizers'         },
  { bit: 4, value: 16, label: 'Class 5', desc: 'Toxic substances'  },
  { bit: 5, value: 32, label: 'Class 6', desc: 'Corrosives'        },
]

export const ADR_MAX = 63 // tüm sınıflar açık: 1+2+4+8+16+32

// ─── Skill limit (her skill 0–6 arası)
export const SKILL_MAX = 6
export const SKILL_MIN = 0

// ─── Preset değerleri
export const PRESETS = {
  maxMoney: 999_999_999,
  maxXP:    13_368_000,   // Lv 100 eşiği
  maxSkill: SKILL_MAX,
  maxADR:   ADR_MAX,
}

// ─── Güvenli üst sınırlar (aşılamaz)
export const LIMITS = {
  money: { min: -999_999_999, max: 999_999_999 },
  xp:    { min: 0,            max: 99_999_999  },
  skill: { min: SKILL_MIN,    max: SKILL_MAX   },
  adr:   { min: 0,            max: ADR_MAX     },
}