import { View, Text, TouchableOpacity, Image } from "react-native";
import { useState, useRef, useEffect } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router"; // 👈 importa o router

export default function Camera() {
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  const router = useRouter(); // 👈 inicializa o router

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text>Carregando permissões...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <Text className="text-gray-800 mb-3">Permita o acesso à câmera</Text>
        <TouchableOpacity
          className="bg-blue-600 px-4 py-2 rounded-lg"
          onPress={requestPermission}
        >
          <Text className="text-white font-semibold">Conceder permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const tirarFoto = async () => {
    if (cameraRef.current) {
      const data = await cameraRef.current.takePictureAsync();
      setPhoto(data.uri);
    }
  };

  if (photo) {
    return (
      <View className="flex-1 bg-gray-100 items-center justify-center">
        <Image
          source={{ uri: photo }}
          className="w-11/12 h-[70%] rounded-2xl mb-5"
        />
        <View className="flex-row gap-3">
          <TouchableOpacity
            className="bg-blue-600 px-5 py-3 rounded-xl"
            onPress={() => setPhoto(null)}
          >
            <Text className="text-white font-semibold text-base">
              Tirar outra
            </Text>
          </TouchableOpacity>

          {/* 🔹 Botão para fechar */}
          <TouchableOpacity
            className="bg-gray-400 px-5 py-3 rounded-xl"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold text-base">Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <CameraView className="flex-1" ref={cameraRef} facing="back">
        <View className="flex-1 items-center justify-end pb-10 bg-transparent">
          {/* 🔹 Botão de fechar no canto superior */}
          <TouchableOpacity
            className="absolute top-12 left-5 bg-white p-2 rounded-full shadow"
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>

          <Text className="absolute top-1/2 text-gray-800 text-base">
            Camera Screen
          </Text>

          <TouchableOpacity
            className="bg-white border-2 border-gray-800 p-5 rounded-full"
            onPress={tirarFoto}
          >
            <Ionicons name="camera" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}
