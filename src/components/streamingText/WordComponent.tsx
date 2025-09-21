import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { RenderHTML } from "react-native-render-html";
import { AppConfig } from "../../constants/appConfig";
import { CustomText } from "../text/customText";

interface WordComponentProps {
  word: string;
  fontSize?: number;
  color?: string;
}

export const WordComponent = ({ word, fontSize, color }: WordComponentProps) => {
  const isHTML = (text: string) => {
    const htmlPattern = /<[^>]*>/g;
    return htmlPattern.test(text);
  };

  const handleOpenLink = (link: string) => {
    try {
      // Sử dụng Linking để mở link
      import("react-native").then(({ Linking }) => {
        Linking.openURL(link);
      });
    } catch (e) {
      // Có thể log lỗi hoặc thông báo cho người dùng
    }
  };

  const renderContent = () => {
    if (word == "\n") return <View style={{ width: 1000, height: 5 }} />;

    if (!word || word.trim() === "") return <View style={{ width: 0, height: 0 }} />;

    if (isHTML(word)) {
      return (
        <RenderHTML
          contentWidth={300}
          source={{ html: word }}
          tagsStyles={{
            b: { fontWeight: "bold", fontFamily: AppConfig.fontFamily },
            i: { fontStyle: "italic", fontFamily: AppConfig.fontFamily },
            u: { textDecorationLine: "underline" },
            strong: { fontWeight: "bold", fontFamily: AppConfig.fontFamily },
            em: { fontStyle: "italic", fontFamily: AppConfig.fontFamily },
            code: {
              backgroundColor: "#f0f0f0",
              padding: 2,
              borderRadius: 3,
              fontSize: fontSize || 14,
              color: color || "black",
              fontFamily: AppConfig.fontFamily,
            },
            pre: {
              backgroundColor: "#f0f0f0",
              padding: 8,
              borderRadius: 5,
              marginVertical: 4,
              fontSize: fontSize || 14,
              color: color || "black",
              fontFamily: AppConfig.fontFamily,
            },
            p: {
              margin: 0,
              fontSize: fontSize || 14,
              color: color || "black",
              fontFamily: AppConfig.fontFamily,
            },
            div: {
              margin: 0,
              fontSize: fontSize || 14,
              color: color || "black",
              fontFamily: AppConfig.fontFamily,
            },
          }}
        />
      );
    } else if (word.startsWith("**") && word.endsWith("**")) {
      return (
        <CustomText
          weight="Bold"
          style={{
            fontSize: fontSize || 14,
            color: color || "black",
          }}
        >
          {word.slice(2, -2)}
        </CustomText>
      );
    } else if (word.includes("http://") || word.includes("https://")) {
      return (
        <CustomText
          weight="Regular"
          style={{ fontSize: fontSize, color: "blue", textDecorationLine: "underline" }}
          onPress={() => handleOpenLink(word)}
        >
          {word}
        </CustomText>
      );
    } else {
      return (
        <CustomText weight="Regular" style={{ fontSize: fontSize, color: color }}>
          {word}
        </CustomText>
      );
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);

  return <Animated.View style={{ marginRight: 4, marginBottom: 3, opacity: fadeAnim }}>{renderContent()}</Animated.View>;
};
