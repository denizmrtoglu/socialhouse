import React from 'react'
import { Pressable as RNPressable, PressableProps, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'

const AnimatedPressable = Animated.createAnimatedComponent(RNPressable)

interface PressableAnimatedProps extends PressableProps {
  scaleOnPress?: number
  style?: ViewStyle | ViewStyle[]
}

/**
 * Animasyonlu Pressable.
 * Basıldığında subtle scale + opacity efekti uygular.
 */
export function Pressable({
  scaleOnPress = 0.97,
  onPressIn,
  onPressOut,
  style,
  ...props
}: PressableAnimatedProps) {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  const handlePressIn = (e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) => {
    scale.value = withSpring(scaleOnPress, { damping: 15, stiffness: 400 })
    opacity.value = withSpring(0.85, { damping: 15, stiffness: 400 })
    onPressIn?.(e)
  }

  const handlePressOut = (e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 })
    opacity.value = withSpring(1, { damping: 15, stiffness: 400 })
    onPressOut?.(e)
  }

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, style as ViewStyle]}
      {...props}
    />
  )
}
