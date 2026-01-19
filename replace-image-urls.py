#!/usr/bin/env python3
import re

# 图片URL映射
BASE_URL = "https://raw.githubusercontent.com/ricarvy/tarot_source/main/result/"

MAJOR_IMAGES = {
    0: "Major/The_Fool_New_beginnings.png",
    1: "Major/The_Magician_Creativity.png",
    2: "Major/The_High_Priestess_Intuition.png",
    3: "Major/The_Empress_Abundance.png",
    4: "Major/The_Emperor_Authority.png",
    5: "Major/The_Hierophant_Tradition.png",
    6: "Major/The_Lovers_Love.png",
    7: "Major/The_Chariot_Victory.png",
    8: "Major/Strength_Strength.png",
    9: "Major/The_Hermit_Introspection.png",
    10: "Major/Wheel_of_Fortune_Destiny.png",
    11: "Major/Justice_Justice.png",
    12: "Major/The_Hanged_Man_Sacrifice.png",
    13: "Major/Death_Change.png",
    14: "Major/Temperance_Balance.png",
    15: "Major/The_Devil_Temptation.png",
    16: "Major/The_Tower_Sudden_change.png",
    17: "Major/The_Star_Hope.png",
    18: "Major/The_Moon_Illusion.png",
    19: "Major/The_Sun_Success.png",
    20: "Major/Judgement_Rebirth.png",
    21: "Major/The_World_Completion.png",
}

WANDS_IMAGES = {
    22: "Minor/Ace_of_Wands_Creativity.png",
    23: "Minor/Two_of_Wands_Planning.png",
    24: "Minor/Three_of_Wands_Expansion.png",
    25: "Minor/Four_of_Wands_Stability.png",
    26: "Minor/Five_of_Wands_Competition.png",
    27: "Minor/Six_of_Wands_Victory.png",
    28: "Minor/Seven_of_Wands_Challenge.png",
    29: "Minor/Eight_of_Wands_Speed.png",
    30: "Minor/Nine_of_Wands_Persistence.png",
    31: "Minor/Ten_of_Wands_Burden.png",
    32: "Minor/Page_of_Wands_Exploration.png",
    33: "Minor/Knight_of_Wands_Adventure.png",
    34: "Minor/Queen_of_Wands_Confidence.png",
    35: "Minor/King_of_Wands_Leadership.png",
}

CUPS_IMAGES = {
    36: "Minor/Ace_of_Cups_New_feelings.png",
    37: "Minor/Two_of_Cups_Partnership.png",
    38: "Minor/Three_of_Cups_Friendship.png",
    39: "Minor/Four_of_Cups_Apathy.png",
    40: "Minor/Five_of_Cups_Disappointment.png",
    41: "Minor/Six_of_Cups_Nostalgia.png",
    42: "Minor/Seven_of_Cups_Fantasy.png",
    43: "Minor/Eight_of_Cups_Abandonment.png",
    44: "Minor/Nine_of_Cups_Satisfaction.png",
    45: "Minor/Ten_of_Cups_Happiness.png",
    46: "Minor/Page_of_Cups_Sensitivity.png",
    47: "Minor/Knight_of_Cups_Romance.png",
    48: "Minor/Queen_of_Cups_Intuition.png",
    49: "Minor/King_of_Cups_Emotional_maturity.png",
}

SWORDS_IMAGES = {
    50: "Minor/Ace_of_Swords_Clarity.png",
    51: "Minor/Two_of_Swords_Indecision.png",
    52: "Minor/Three_of_Swords_Heartbreak.png",
    53: "Minor/Four_of_Swords_Rest.png",
    54: "Minor/Five_of_Swords_Defeat.png",
    55: "Minor/Six_of_Swords_Transition.png",
    56: "Minor/Seven_of_Swords_Deception.png",
    57: "Minor/Eight_of_Swords_Restriction.png",
    58: "Minor/Nine_of_Swords_Anxiety.png",
    59: "Minor/Ten_of_Swords_Ruin.png",
    60: "Minor/Page_of_Swords_Curiosity.png",
    61: "Minor/Knight_of_Swords_Impulsiveness.png",
    62: "Minor/Queen_of_Swords_Independence.png",
    63: "Minor/King_of_Swords_Logic.png",
}

PENTACLES_IMAGES = {
    64: "Minor/Ace_of_Pentacles_Material_opportunity.png",
    65: "Minor/Two_of_Pentacles_Balance.png",
    66: "Minor/Three_of_Pentacles_Teamwork.png",
    67: "Minor/Four_of_Pentacles_Security.png",
    68: "Minor/Five_of_Pentacles_Hardship.png",
    69: "Minor/Six_of_Pentacles_Generosity.png",
    70: "Minor/Seven_of_Pentacles_Assessment.png",
    71: "Minor/Eight_of_Pentacles_Dedication.png",
    72: "Minor/Nine_of_Pentacles_Independence.png",
    73: "Minor/Ten_of_Pentacles_Wealth.png",
    74: "Minor/Page_of_Pentacles_Learning.png",
    75: "Minor/Knight_of_Pentacles_Responsibility.png",
    76: "Minor/Queen_of_Pentacles_Abundance.png",
    77: "Minor/King_of_Pentacles_Wealth.png",
}

ALL_IMAGES = {**MAJOR_IMAGES, **WANDS_IMAGES, **CUPS_IMAGES, **SWORDS_IMAGES, **PENTACLES_IMAGES}

# 读取原文件
with open('src/lib/tarot-cards.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 替换图片URL
for card_id, image_path in ALL_IMAGES.items():
    new_url = BASE_URL + image_path
    # 查找该ID的图片URL并替换
    pattern = rf'id: {card_id},.*?imageUrl:\s*[\'"]([^\'\"]+)[\'"]'
    match = re.search(pattern, content, re.DOTALL)
    if match:
        old_url = match.group(1)
        content = content.replace(old_url, new_url)
        print(f"Updated card {card_id}: {old_url} -> {new_url}")
    else:
        print(f"Warning: Could not find imageUrl for card {card_id}")

# 写回文件
with open('src/lib/tarot-cards.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✓ Image URLs updated successfully")
