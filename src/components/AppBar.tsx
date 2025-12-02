import React, { useRef } from "react";
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { useAppTheme } from "../theme";
import { CustomText } from "./text/customText";
import { useAppDispatch } from "../hooks/hooks";
import { toggleDevMode } from "../core/app/AppConfig";
import { useSelector } from "react-redux";
import { RootState } from "../core/app/store";
import { AsyncStorageService, ToastService } from "../core/service";

interface AppBarProps {
  title: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  onDevClick?: () => void;
}

export const AppBar: React.FC<AppBarProps> = ({ title, leftIcon, rightIcon, onLeftPress, onRightPress, onDevClick }) => {
  const { colors } = useAppTheme();
  const dispatch = useAppDispatch();
  const devMode = useSelector((state: RootState) => state.appConfig.devMode);

  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  const handleDevClick = () => {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastClickTimeRef.current;

    if (timeDiff < 1000) {
      clickCountRef.current += 1;
    } else {
      clickCountRef.current = 1;
    }

    lastClickTimeRef.current = currentTime;

    if (clickCountRef.current >= 10) {
      dispatch(toggleDevMode());
      AsyncStorageService.setDevMode(!devMode);
      ToastService.show({ message: "Dev mode: " + (!devMode ? "ON" : "OFF"), type: "success" });
      clickCountRef.current = 0;
    }
  };

  const handleDevLongPress = () => {
    onDevClick?.();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.primary }]}>
      {leftIcon ? (
        <TouchableOpacity
          style={[styles.iconContainer, styles.iconButton, { backgroundColor: "rgba(255, 255, 255, 0.2)" }]}
          onPress={onLeftPress}
          activeOpacity={0.7}
        >
          {leftIcon}
        </TouchableOpacity>
      ) : (
        <View style={styles.iconContainer} />
      )}

      <TouchableOpacity style={styles.titleContainer} onPress={handleDevClick} onLongPress={handleDevLongPress}>
        <CustomText weight="Bold" style={[styles.title, { color: "white" }]}>
          {title}
        </CustomText>
      </TouchableOpacity>

      {rightIcon ? (
        <TouchableOpacity
          style={[styles.iconContainer, styles.iconButton, { backgroundColor: "rgba(255, 255, 255, 0.2)" }]}
          onPress={onRightPress}
          activeOpacity={0.7}
        >
          {rightIcon}
        </TouchableOpacity>
      ) : (
        <View style={styles.iconContainer} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  gradient: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  titleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
