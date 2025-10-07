import * as Application from "expo-application";

export const AppConfig = {
  devMode: __DEV__,
  name: "AIkaze",
  fontFamily: "Inter-Regular",
  androidPackageName: "com.leslie.app",
  version: Application.nativeApplicationVersion,
  buildVersion: Application.nativeBuildVersion,
};
