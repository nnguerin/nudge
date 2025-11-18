import { Pressable, Text } from 'react-native';

interface FilterPillProps {
  onPress: () => void;
  title: string;
  isActive: boolean;
}

const FilterPill = ({ onPress, title, isActive }: FilterPillProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-4 py-2 ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}>
      <Text className={isActive ? 'font-medium text-white' : 'text-gray-700'}>{title}</Text>
    </Pressable>
  );
};

export default FilterPill;
