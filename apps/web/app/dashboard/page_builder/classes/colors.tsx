import { colorGroups } from '@/app/src/constants';

type ColorType = 'text' | 'bg' | 'border';

const colorTypes: ColorType[] = ['text', 'bg', 'border'];

let valueCounter = 0;

export const objectColorOptions = colorTypes.flatMap((type) => {
  return Object.entries(colorGroups).flatMap(([color, shades]) => {
    return shades.map((shade) => {
      const className = `${type}-${color}${shade !== null ? `-${shade}` : ''}`;
      const title = `${color} ${shade ?? ''} ${type === 'text' ? 'color' : type}`.trim();
      return {
        class: className,
        title,
        value: valueCounter++,
      };
    });
  });
});
