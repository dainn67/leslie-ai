import React, { useEffect, useRef } from "react";
import { Animated, View, Linking } from "react-native";
import { RenderHTML } from "react-native-render-html";
import { BaseAppConfig } from "../../constants/baseAppConfig";
import { CustomText } from "../text/customText";
import { DiscordService, DiscordWebhookType, ToastService } from "../../core/service";

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
      Linking.openURL(link);
    } catch (e) {
      ToastService.show({ message: "Lỗi khi mở link", type: "error" });
      DiscordService.sendDiscordMessage({
        message: `Lỗi khi mở link: ${link}\n${JSON.stringify(e)}`,
        type: DiscordWebhookType.ERROR,
      });
    }
  };

  const renderContent = () => {
    if (word == "\n") return <View style={{ width: 1000, height: 5 }} />;

    if (!word || word.trim() === "") return <View style={{ width: 0, height: 0 }} />;

    const fontFamily = BaseAppConfig.fontFamily;

    if (isHTML(word)) {
      return (
        <RenderHTML
          contentWidth={300}
          source={{ html: word }}
          tagsStyles={{
            b: { fontWeight: "bold", fontFamily },
            i: { fontStyle: "italic", fontFamily },
            u: { textDecorationLine: "underline" },
            strong: { fontWeight: "bold", fontFamily },
            em: { fontStyle: "italic", fontFamily },
            code: {
              backgroundColor: "#f0f0f0",
              padding: 2,
              borderRadius: 3,
              fontSize: fontSize || 14,
              color: color || "black",
              fontFamily,
            },
            pre: {
              backgroundColor: "#f0f0f0",
              padding: 8,
              borderRadius: 5,
              marginVertical: 4,
              fontSize: fontSize || 14,
              color: color || "black",
              fontFamily,
            },
            p: {
              margin: 0,
              fontSize: fontSize || 14,
              color: color || "black",
              fontFamily,
            },
            div: {
              margin: 0,
              fontSize: fontSize || 14,
              color: color || "black",
              fontFamily,
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
