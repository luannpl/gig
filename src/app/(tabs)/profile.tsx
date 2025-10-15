import React, { JSX, useState } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  TouchableOpacity, 
  Dimensions, 
  NativeSyntheticEvent, 
  NativeScrollEvent 
} from 'react-native';
import { Image } from 'expo-image';
// Importamos o ReactNode do React para tipar o 'icon'
import { ReactNode } from 'react';
import { ArrowLeft, MapPin, Users, Music, ExternalLink } from 'lucide-react-native';

const { width } = Dimensions.get('window');
// Usamos o 'width' da tela menos o padding horizontal (32px ou p-4 + p-4) e margem entre itens
const ITEM_WIDTH = width - 32;
const ITEM_MARGIN_RIGHT = 12;
const ITEM_FULL_WIDTH = ITEM_WIDTH + ITEM_MARGIN_RIGHT;

// ===================================
// TIPAGEM DOS DADOS (INTERFACES)
// ===================================

/**
 * Interface para um item de foto no carrossel.
 */
interface Photo {
  uri: string;
}

/**
 * Interface para um evento.
 */
interface Event {
  name: string;
  action: string;
}

/**
 * Interface para um item de rede social.
 */
interface Social {
  name: string;
  action: string;
  icon: ReactNode; // O ícone é um componente React, então usamos ReactNode
}

/**
 * Interface principal para todos os dados do perfil do estabelecimento.
 */
interface ProfileData {
  headerImage: string;
  name: string;
  category: string;
  followers: string;
  location: string;
  photos: Photo[];
  description: string;
  events: Event[];
  socials: Social[];
}


// --- DADOS DO ESTABELECIMENTO (Mock) ---
// Tipamos o objeto diretamente com a interface ProfileData
const profileData: ProfileData = {
  headerImage: "https://images.unsplash.com/photo-1549462525-58e1c31c9470?q=80&w=3570&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  name: "Hard Rock Café",
  category: "Restaurante / casa de show",
  followers: "1,6 Mil",
  location: "Fortaleza, CE",
  photos: [
    { uri: "https://images.unsplash.com/photo-1616885373199-0f666f77259f?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { uri: "https://images.unsplash.com/photo-1596701083236-31a318182746?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { uri: "https://images.unsplash.com/photo-1623192004246-8848f0e5b7c7?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
    { uri: "https://images.unsplash.com/photo-1563851544458-152865d4b574?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  ],
  description: "O Hard Rock Cafe é uma cadeia de restaurantes e entretenimento conhecida por sua temática rock 'n' roll, decorada com memorabilia de músicos famosos. Oferecendo uma experiência única, combina uma atmosfera vibrante com uma variedade de pratos clássicos, drinks e música ao vivo. O café também é famoso por suas lojas de produtos personalizados, tornando-se um destino para fãs de música e cultura pop.",
  events: [
    { name: "Audioslave", action: "Comprar" },
    { name: "Kyuss", action: "Comprar" },
  ],
  socials: [
    // Definimos o tipo dos ícones como ReactNode na interface
    { name: "Instagram", action: "Acessar", icon: <ExternalLink size={18} color="#4B5563" /> },
    { name: "Facebook", action: "Acessar", icon: <ExternalLink size={18} color="#4B5563" /> },
  ],
};

// ===================================
// COMPONENTE PRINCIPAL
// ===================================

// Definimos o componente como uma função de componente React padrão
export default function Profile(): JSX.Element {
  // Estado para rastrear o índice da foto ativa, tipado como number
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Função para atualizar o estado no evento de rolagem
  // Tipamos o evento como NativeSyntheticEvent<NativeScrollEvent>
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    // Calcula o índice arredondando o deslocamento pela largura completa do item
    // O ITEM_FULL_WIDTH é usado para garantir o encaixe correto
    const currentIndex = Math.round(contentOffsetX / ITEM_FULL_WIDTH);

    if (currentIndex !== activeIndex) {
      setActiveIndex(currentIndex);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* 1. IMAGEM DO HEADER E SETA DE VOLTAR */}
      {/* O componente Image da expo-image aceita `source` tipado para URI */}
      <Image
        source={{ uri: profileData.headerImage }}
        className="w-full h-48 bg-gray-200"
        contentFit="cover"
      />
      {/* Adicionar um botão de Voltar aqui, embora não estivesse no código original, é boa prática */}
      <TouchableOpacity 
        className="absolute top-10 left-4 p-2 bg-white/70 rounded-full" 
        onPress={() => console.log('Voltar')}
      >
        <ArrowLeft size={24} color="#000" />
      </TouchableOpacity>

      {/* 2. CONTEÚDO SCROLLÁVEL */}
      <ScrollView className="flex-1 -mt-6 bg-white rounded-t-xl">
        <View className="p-4 space-y-6">

          {/* INFORMAÇÕES BÁSICAS */}
          <View className="space-y-1 pb-2">
            <Text className="text-3xl font-bold text-gray-900">
              {profileData.name}
            </Text>
            <Text className="text-gray-500 text-sm">
              {profileData.category}
            </Text>
          </View>

          {/* BOTÕES DE INFORMAÇÃO E AÇÃO */}
          <View className="flex-row justify-around p-4 border border-gray-200 rounded-lg">
            {/* Seguidores */}
            <View className="items-center space-y-1">
              <Users size={20} color="#4B5563" />
              <Text className="text-sm text-gray-700 font-bold">
                {profileData.followers}
              </Text>
              <Text className="text-xs text-gray-500">
                seguidores
              </Text>
            </View>

            {/* Separador Vertical */}
            <View className="w-px h-10 bg-gray-200" />

            {/* Localização */}
            <View className="items-center space-y-1">
              <MapPin size={20} color="#4B5563" />
              <Text className="text-sm text-gray-700 font-bold">
                {profileData.location}
              </Text>
              <Text className="text-xs text-gray-500">
                Local
              </Text>
            </View>
          </View>

          {/* 3. GALERIA DE FOTOS (Carrossel Paginado com Bolinhas) */}
          <View className="space-y-3 pt-4 border border-gray-200 rounded-lg p-4">
            <Text className="text-xl font-bold text-gray-900">Fotos</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled={true}
              snapToInterval={ITEM_FULL_WIDTH} // Largura da imagem + margem
              decelerationRate="fast"
              snapToAlignment="start"
              onScroll={handleScroll} // Handler de scroll tipado
              scrollEventThrottle={16}
            >
              {/* Tipamos 'photo' como Photo e 'index' como number */}
              {profileData.photos.map((photo: Photo, index: number) => (
                <Image
                  key={index}
                  source={{ uri: photo.uri }}
                  className="h-48 rounded-lg bg-gray-200"
                  style={{ width: ITEM_WIDTH, height: 180, marginRight: ITEM_MARGIN_RIGHT }}
                  contentFit="cover"
                />
              ))}
            </ScrollView>

            {/* INDICADORES DE PAGINAÇÃO (BOLINHAS) */}
            <View className="flex-row justify-center space-x-2">
              {profileData.photos.map((_, index: number) => (
                <View
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === activeIndex ? 'bg-gray-800 w-3' : 'bg-gray-300'
                  }`}
                />
              ))}
            </View>
          </View>

          {/* 4. DESCRIÇÃO */}
          <View className="space-y-3 pt-4 border border-gray-200 rounded-lg p-4">
            <Text className="text-xl font-bold text-gray-900">Descrição</Text>
            <Text className="text-gray-700 leading-relaxed text-base">
              {profileData.description}
            </Text>
          </View>

          {/* 5. NOSSOS EVENTOS */}
          <View className="space-y-3 pt-4 border border-gray-200 rounded-lg p-4">
            <Text className="text-xl font-bold text-gray-900">Nossos eventos</Text>
            {/* Tipamos 'event' como Event e 'index' como number */}
            {profileData.events.map((event: Event, index: number) => (
              <View key={index} className="flex-row justify-between items-center py-2">
                <View className="flex-row items-center space-x-2">
                  <Music size={20} color="#4B5563" />
                  <Text className="text-gray-700 text-base">{event.name}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => console.log(`Ação: ${event.action} ${event.name}`)}
                  className="px-4 py-2 border border-black bg-white rounded-lg shadow-sm"
                >
                  <Text className="text-black font-semibold text-sm">
                    {event.action}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* 6. REDES SOCIAIS */}
          <View className="space-y-3 pt-4 border border-gray-200 rounded-lg p-4">
            <Text className="text-xl font-bold text-gray-900">Redes Sociais</Text>
            {/* Tipamos 'social' como Social e 'index' como number */}
            {profileData.socials.map((social: Social, index: number) => (
              <View key={index} className="flex-row justify-between items-center py-2">
                <View className="flex-row items-center space-x-2">
                  {social.icon}
                  <Text className="text-gray-700 text-base">{social.name}</Text>
                </View>

                {/* BOTÃO 'ACESSAR' CUSTOMIZADO COM TAILWIND/NATIVEWIND */}
                <TouchableOpacity
                  onPress={() => console.log(`Ação: ${social.action} ${social.name}`)}
                  className="px-4 py-2 border border-black bg-white rounded-lg shadow-sm"
                >
                  <Text className="text-black font-semibold text-sm">
                    {social.action}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}