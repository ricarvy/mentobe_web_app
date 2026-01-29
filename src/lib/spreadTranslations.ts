import { useI18n } from '@/lib/i18n';
import { Spread } from '@/lib/tarot';

export function useSpreadTranslations() {
  const { t } = useI18n();

  const getTranslatedSpread = (spread: Spread): Spread => {
    type PositionsSingle = { position1: string; position1Desc: string };
    type PositionsThree = { position1: string; position1Desc: string; position2: string; position2Desc: string; position3: string; position3Desc: string };
    type PositionsCross = {
      position1: string; position1Desc: string;
      position2: string; position2Desc: string;
      position3: string; position3Desc: string;
      position4: string; position4Desc: string;
      position5: string; position5Desc: string;
      position6: string; position6Desc: string;
      position7: string; position7Desc: string;
      position8: string; position8Desc: string;
      position9: string; position9Desc: string;
      position10: string; position10Desc: string;
    };
    type SpreadTranslations = {
      single: string;
      singleDesc: string;
      three: string;
      threeDesc: string;
      cross: string;
      crossDesc: string;
      positions: {
        single: PositionsSingle;
        three: PositionsThree;
        cross: PositionsCross;
      };
    };
    const translations = t.spreads as unknown as SpreadTranslations;

    let translatedName = '';
    let translatedDesc = '';
    const translatedPositions = spread.positions.map((pos) => {
      let translatedPosName = pos.name;
      let translatedPosDesc = pos.description;

      if (spread.id === 'single') {
        translatedName = translations.single;
        translatedDesc = translations.singleDesc;
        translatedPosName = translations.positions.single.position1;
        translatedPosDesc = translations.positions.single.position1Desc;
      } else if (spread.id === 'three') {
        translatedName = translations.three;
        translatedDesc = translations.threeDesc;
        if (pos.id === 'position1') {
          translatedPosName = translations.positions.three.position1;
          translatedPosDesc = translations.positions.three.position1Desc;
        } else if (pos.id === 'position2') {
          translatedPosName = translations.positions.three.position2;
          translatedPosDesc = translations.positions.three.position2Desc;
        } else if (pos.id === 'position3') {
          translatedPosName = translations.positions.three.position3;
          translatedPosDesc = translations.positions.three.position3Desc;
        }
      } else if (spread.id === 'cross') {
        translatedName = translations.cross;
        translatedDesc = translations.crossDesc;
        if (pos.id === 'position1') {
          translatedPosName = translations.positions.cross.position1;
          translatedPosDesc = translations.positions.cross.position1Desc;
        } else if (pos.id === 'position2') {
          translatedPosName = translations.positions.cross.position2;
          translatedPosDesc = translations.positions.cross.position2Desc;
        } else if (pos.id === 'position3') {
          translatedPosName = translations.positions.cross.position3;
          translatedPosDesc = translations.positions.cross.position3Desc;
        } else if (pos.id === 'position4') {
          translatedPosName = translations.positions.cross.position4;
          translatedPosDesc = translations.positions.cross.position4Desc;
        } else if (pos.id === 'position5') {
          translatedPosName = translations.positions.cross.position5;
          translatedPosDesc = translations.positions.cross.position5Desc;
        } else if (pos.id === 'position6') {
          translatedPosName = translations.positions.cross.position6;
          translatedPosDesc = translations.positions.cross.position6Desc;
        } else if (pos.id === 'position7') {
          translatedPosName = translations.positions.cross.position7;
          translatedPosDesc = translations.positions.cross.position7Desc;
        } else if (pos.id === 'position8') {
          translatedPosName = translations.positions.cross.position8;
          translatedPosDesc = translations.positions.cross.position8Desc;
        } else if (pos.id === 'position9') {
          translatedPosName = translations.positions.cross.position9;
          translatedPosDesc = translations.positions.cross.position9Desc;
        } else if (pos.id === 'position10') {
          translatedPosName = translations.positions.cross.position10;
          translatedPosDesc = translations.positions.cross.position10Desc;
        }
      }

      return {
        ...pos,
        name: translatedPosName,
        description: translatedPosDesc,
      };
    });

    return {
      ...spread,
      name: translatedName,
      description: translatedDesc,
      positions: translatedPositions,
    };
  };

  return { getTranslatedSpread };
}
