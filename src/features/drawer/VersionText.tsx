import React from "react";
import { AppConfig } from "../../constants/appConfig";
import { CustomText } from "../../components/text/customText";
import { useAppTheme } from "../../theme";

export const VersionText = () => {
  const { colors } = useAppTheme();

  return (
    <CustomText
      style={{
        marginLeft: 16,
        marginVertical: 8,
        fontSize: 14,
        textDecorationLine: "underline",
        fontStyle: "italic",
        color: colors.text,
      }}
    >{`v${AppConfig.version} ${AppConfig.devMode ? `(${AppConfig.buildVersion})` : ""}`}</CustomText>
  );
};
