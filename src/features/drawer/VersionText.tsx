import React from "react";
import { AppConfig } from "../../constants/appConfig";
import { CustomText } from "../../components/text/customText";
import { useAppTheme } from "../../theme";
import { useTranslation } from "react-i18next";

export const VersionText = () => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

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
    >{`${t("drawer_version")}: ${AppConfig.version} ${AppConfig.devMode ? `(${AppConfig.buildVersion})` : ""}`}</CustomText>
  );
};
