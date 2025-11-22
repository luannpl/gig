import { useQuery } from "@tanstack/react-query";
import { Text, View, StyleSheet } from "react-native";
import { Contract } from "../types/contracts";
import api from "../services/api";

// Tipagem para o perfil do usuário logado
type Profile = {
  id: string;
  band: {
    id: number;
  } | null;
  venue: {
    id: string;
  } | null;
};

type UserInfo = {
  id: string | number;
  type: "band" | "venue"; // Garante que o tipo seja especificamente 'band' ou 'venue'
  endpoint: string;
};

type ContractsListProps = {
  selectedDate?: string; // YYYY-MM-DD
};

const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return "";
  // Se já está no formato YYYY-MM-DD retorna direto
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Se vier com timestamp (YYYY-MM-DDTHH:mm:ssZ) pega só a parte da data
  const firstPart = dateStr.split("T")[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(firstPart)) return firstPart;
  // Fallback: corta primeiros 10 caracteres
  return dateStr.slice(0, 10);
};

export default function ContractsList({ selectedDate }: ContractsListProps) {
  const { data: me, isLoading: isLoadingProfile } = useQuery<Profile>({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/users/me");
      return data;
    },
  });

  // Determina o ID, tipo e endpoint da API baseado no perfil do usuário
  const getUserInfo = (): UserInfo | null => {
    if (!me) return null;

    if (me.band) {
      return {
        id: me.band.id,
        type: "band",
        endpoint: `/contract/band/${me.band.id}`,
      };
    } else if (me.venue) {
      return {
        id: me.venue.id,
        type: "venue",
        endpoint: `/contract/venue/${me.venue.id}`,
      };
    }

    return null;
  };

  const userInfo = getUserInfo();

  // Busca os contratos do usuário, habilitado apenas quando 'userInfo' estiver disponível
  const { data: contracts, isLoading: isLoadingContracts } = useQuery<
    Contract[]
  >({
    queryKey: ["contracts", userInfo?.id, userInfo?.type],
    queryFn: async () => {
      if (!userInfo) throw new Error("Usuário não encontrado");
      const { data } = await api.get<Contract[]>(userInfo.endpoint);
      return data;
    },
    enabled: !!userInfo,
  });

  const filtered = (contracts ?? [])
    .filter((c) => c.status === "confirmed")
    .filter((c) => {
      if (!selectedDate) return true;
      return normalizeDate(c.eventDate) === selectedDate;
    })
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );

  if (isLoadingContracts) {
    return (
      <View style={styles.container}>
        <Text style={styles.muted}>Carregando contratos...</Text>
      </View>
    );
  }

  if (!contracts || filtered.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyTitle}>Nenhum contrato neste dia</Text>
        {selectedDate && <Text style={styles.muted}>{selectedDate}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {filtered.map((contract) => (
        <View key={contract.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.eventName}>{contract.eventName}</Text>
            <View style={styles.budgetPill}>
              <Text style={styles.budgetText}>
                {`R$ ${(contract.budget || 0).toLocaleString("pt-BR")}`}
              </Text>
            </View>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.meta}>
              {normalizeDate(contract.eventDate)}
              {contract.startTime ? ` • ${contract.startTime}` : ""}
              {contract.endTime ? ` - ${contract.endTime}` : ""}
            </Text>
            <Text style={styles.metaRight}>{contract.requester?.name}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    width: "100%",
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    marginBottom: 4,
  },
  muted: {
    fontSize: 12,
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  eventName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    flex: 1,
    paddingRight: 8,
  },
  budgetPill: {
    backgroundColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  budgetText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meta: {
    fontSize: 12,
    color: "#6b7280",
  },
  metaRight: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
    marginLeft: 8,
  },
});
