import ProfileBand from "@/src/components/profiles/ProfileBand";
import ProfileVenue from "@/src/components/profiles/ProfileVenue";
import { getMe } from "@/src/services/auth";
import { BandSignUpData, VenueSignUpData } from "@/src/types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { use, useEffect, useState } from "react";
import { View } from "react-native";

export default function Profile() {
  const [user, setUser] = useState<{ role: "band" | "venue" | null }>({
    role: null,
  });

  useEffect(() => {
    // Simulando a obtenção de dados do usuário
    const fetchUserData = async () => {
      const token = await AsyncStorage.getItem("token");
      const userData: VenueSignUpData | BandSignUpData = await getMe(
        token || ""
      );
      setUser(userData.role ? { role: userData.role } : { role: null });
    };

    fetchUserData();
  }, []);

  return (
    <View className="flex-1">
      {user.role === "band" && <ProfileBand />}
      {user.role === "venue" && <ProfileVenue />}
    </View>
  );
}
