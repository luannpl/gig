import { View, Text, TextInput, Image, FlatList, StyleSheet } from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

// ../ para subir um nível e para entrar na pasta nomePasta/
const bands = [
  {
    id: "1", name: "Audioslave", genre: "Grunge", rating: 4.7, image: require("../../assets/images/audioslave.jpg"),
},
  {
    id: "2", name: "Dua Lipa", genre: "Pop", rating: 4.8, image: require("../../assets/images/dualipa.jpg"),
  },
  {
    id: "3", name: "Chitãozinho e Xororó", genre: "Sertanejo", rating: 4.5, image: require("../../assets/images/xororo.jpg"),
  },
  {
    id: "4", name: "Gal costa", genre: "MPB", rating: 4.9, image: require("../../assets/images/gal-costa.jpg"),
  },
  {
    id: "4", name: "Caetano Veloso", genre: "MPB", rating: 4.9, image: require("../../assets/images/caetano.jpg"),
  },
];

export default function Search( ) {
  const [search, setSearch] = useState("");


  

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-gray-200 py-6 px-4 items-center">
        <Text className="font-bold text-xl">Pesquisa</Text>
      </View>

      {/* Search Bar */}
      <View className="flex-row items-center bg-white px-4 py-2 border-b border-gray-300">
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          placeholder="Pesquisar..."
          value={search}
          onChangeText={setSearch}
          className="flex-1 ml-2 text-base"
        />
        {search.length > 0 && (
          <Ionicons
            name="close"
            size={20}
            color="gray"
            onPress={() => setSearch("")}
          />
        )}
      </View>

      {/* List */}
      <FlatList
        data={bands.filter((b) =>
          b.name.toLowerCase().includes(search.toLowerCase())
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View className="bg-black rounded-xl mb-4 overflow-hidden">
            {/* 3. A propriedade 'source' agora usa a imagem diretamente */}
            <Image
               source={item.image}
              style={{ width: "100%", height: 160 }}
              resizeMode="cover"
            />

            
            <View className="p-3">
              <Text className="text-white font-semibold text-lg">
                {item.name}
              </Text>
              <Text className="text-gray-300 text-sm">{item.genre}</Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="star" size={16} color="yellow" />
                <Text className="text-white ml-1">{item.rating}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
