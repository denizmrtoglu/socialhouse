import React, { ReactNode } from 'react'
import {
  ScrollView,
  View,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme, spacing } from '../../tokens'

interface ScreenProps {
  children: ReactNode
  /** Scroll edilebilir mi? Default: true */
  scrollable?: boolean
  /** SafeArea edge'leri. Default: ['top', 'bottom'] */
  edges?: ('top' | 'bottom' | 'left' | 'right')[]
  /** Pull-to-refresh */
  onRefresh?: () => void
  refreshing?: boolean
  /** Yatay padding */
  paddingH?: number
  /** Üst padding */
  paddingTop?: number
  style?: ViewStyle
  contentStyle?: ViewStyle
}

export function Screen({
  children,
  scrollable = true,
  edges = ['top', 'bottom'],
  onRefresh,
  refreshing = false,
  paddingH = spacing[4],
  paddingTop = spacing[4],
  style,
  contentStyle,
}: ScreenProps) {
  const content = (
    <View
      style={[
        styles.content,
        { paddingHorizontal: paddingH, paddingTop },
        contentStyle,
      ]}
    >
      {children}
    </View>
  )

  return (
    <SafeAreaView
      style={[styles.root, style]}
      edges={edges}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scrollable ? (
          <ScrollView
            style={styles.flex}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={theme.text.muted}
                />
              ) : undefined
            }
          >
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.background.canvas,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
})
