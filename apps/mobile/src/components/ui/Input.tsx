import React, { useState } from 'react'
import {
  TextInput,
  TextInputProps,
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native'
import { Eye, EyeOff } from 'lucide-react-native'
import { theme, spacing, radius, fontSize, fontWeight } from '../../tokens'
import { Text } from '../primitives/Text'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  hint?: string
  containerStyle?: ViewStyle
}

export function Input({ label, error, hint, containerStyle, secureTextEntry, style, ...props }: InputProps) {
  const [visible, setVisible] = useState(false)
  const isPassword = secureTextEntry

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
      )}
      <View style={[styles.inputWrapper, error ? styles.inputError : styles.inputDefault]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={theme.text.muted}
          cursorColor={theme.accent.default}
          selectionColor={theme.accent.subtle}
          secureTextEntry={isPassword && !visible}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity onPress={() => setVisible(v => !v)} style={styles.eyeIcon}>
            {visible
              ? <EyeOff size={18} color={theme.text.muted} />
              : <Eye size={18} color={theme.text.muted} />
            }
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text variant="caption" style={{ color: theme.status.error, marginTop: 4 }}>
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text variant="caption" style={{ marginTop: 4 }}>
          {hint}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[1] + 2,
  },
  label: {
    marginBottom: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: theme.background.surface,
    paddingHorizontal: spacing[3],
  },
  inputDefault: {
    borderColor: theme.border.default,
  },
  inputError: {
    borderColor: theme.status.error,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    color: theme.text.primary,
  },
  eyeIcon: {
    padding: spacing[1],
  },
})
