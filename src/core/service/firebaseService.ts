import analytics from "@react-native-firebase/analytics";

export class FirebaseService {
  static logEvent = async (event: string, data: any) => {
    await analytics().logEvent(event, data);
  };
}
