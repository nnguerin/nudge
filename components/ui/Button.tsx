import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  View,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const variantStyles = {
    primary: styles.primaryButton,
    secondary: styles.secondaryButton,
    danger: styles.dangerButton,
  };

  const sizeStyles = {
    small: styles.smallButton,
    medium: styles.mediumButton,
    large: styles.largeButton,
  };

  const sizeTextStyles = {
    small: styles.smallText,
    medium: styles.mediumText,
    large: styles.largeText,
  };

  const isDisabledOrLoading = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles[variant],
        sizeStyles[size],
        isDisabledOrLoading && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabledOrLoading}
      activeOpacity={0.7}>
      <View style={styles.buttonContent}>
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            {icon && <View style={styles.icon}>{icon}</View>}
            <Text
              style={[
                styles.buttonText,
                variantStyles[variant] === styles.secondaryButton && styles.secondaryText,
                sizeTextStyles[size],
                textStyle,
              ]}>
              {title}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontWeight: '600',
    color: '#fff',
  },
  secondaryText: {
    color: '#007AFF',
  },

  // Variants
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },

  // Sizes
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },

  // Text sizes
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },

  // States
  disabledButton: {
    opacity: 0.5,
  },

  // Icon
  icon: {
    marginRight: 8,
  },
});

export default Button;
