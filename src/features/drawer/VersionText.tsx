import React from "react";
import { CustomText } from "../../components/text/customText";
import { useAppTheme } from "../../theme";
import { useSelector } from "react-redux";
import { RootState } from "../../core/app/store";
import { BaseAppConfig } from "../../constants";

export const VersionText = () => {
  const { colors } = useAppTheme();
  const devMode = useSelector((state: RootState) => state.appConfig.devMode);

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
    >{`v${BaseAppConfig.version} ${devMode ? `(${BaseAppConfig.buildVersion})` : ""}`}</CustomText>
  );
};
