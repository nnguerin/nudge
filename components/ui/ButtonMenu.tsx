import { cn } from '@/utils/cn';
import { colors } from '@/utils/colors';
import { LinearGradient } from 'expo-linear-gradient';
import React, { PropsWithChildren } from 'react';
import { View, TouchableOpacity, Text, GestureResponderEvent } from 'react-native';

interface ButtonMenuProps {
  title?: string;
  style?: object;
  className?: string;
}

interface MenuButtonProps {
  title: string;
  icon?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  showChevron?: boolean;
  style?: object;
  className?: string;
}

const ButtonMenu = ({ title, children, style, className }: PropsWithChildren<ButtonMenuProps>) => {
  return (
    <>
      <Text className={styles.menuTitle}>{title}</Text>
      <View style={style} className={cn(styles.menuContainer, className)}>
        {React.Children.map(children, (child, index) => {
          const isLast = index === React.Children.count(children) - 1;
          return (
            <View key={index} className={isLast ? '' : 'border-b border-b-slate-200'}>
              {child}
            </View>
          );
        })}
      </View>
    </>
  );
};

const MenuButton = ({
  icon,
  title,
  onPress,
  showChevron = true,
  style,
  className,
}: MenuButtonProps) => {
  return (
    <TouchableOpacity
      style={style}
      onPress={onPress}
      activeOpacity={0.7}
      className={cn(styles.menuButton, className)}>
      {/* Icon Container */}
      {icon && (
        <LinearGradient
          colors={[colors.blue[300], colors.blue[200]]}
          style={{ borderRadius: 50, padding: 6, marginRight: 6 }}>
          {icon}
        </LinearGradient>
      )}

      {/* Label */}
      <Text className={styles.buttonTitle}>{title}</Text>

      {/* Chevron */}
      {showChevron && <Text className={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );
};

const styles = {
  menuTitle: 'text-2xl ml-6 text-slate-950',
  menuContainer: 'bg-white rounded-[16px] shadow',
  separator: 'h-1 bg-slate-200',
  menuButton: 'flex flex-row items-center min-h-20 px-6',
  buttonTitle: 'flex-1 text-2xl text-slate-950',
  chevron: 'text-2xl text-slate-600',
};

export { ButtonMenu, MenuButton };
