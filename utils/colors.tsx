import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../tailwind.config'; // adjust path as needed

const fullConfig = resolveConfig(tailwindConfig);
export const colors = fullConfig.theme.colors;
